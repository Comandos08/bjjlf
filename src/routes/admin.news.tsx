/**
 * /admin/news — bilingual news editor with publish + featured toggles.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAdminAuth, canWrite } from "@/lib/admin-auth";
import {
  useAdminNews,
  useUpsertNews,
  useDeleteNews,
  useToggleNewsField,
  type NewsRow,
} from "@/lib/admin-queries";
import {
  AdminButton, AdminToggle, AdminBadge, AdminModal, AdminConfirm,
  BilingualTabs, AdminSection, AdminTableShell, AdminTH, AdminTD, EmptyState,
} from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/news")({
  head: () => ({ meta: [{ title: "Notícias — BJJLF Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: NewsAdminPage,
});

const CATEGORIES = [
  "Campeonatos", "Graduações", "Estilo de Vida", "Resultados", "Entrevistas", "Regras", "Federação",
];

function slugify(s: string) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function NewsAdminPage() {
  const { role } = useAdminAuth();
  const writable = canWrite(role, "news");
  const { data: rows = [], isLoading } = useAdminNews();
  const toggleField = useToggleNewsField();
  const del = useDeleteNews();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<NewsRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<NewsRow | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.title_pt.toLowerCase().includes(q) || r.title_en.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <AdminSection
      title="Notícias"
      actions={writable && <AdminButton onClick={() => setCreating(true)}><Plus size={16} /> Nova Notícia</AdminButton>}
    >
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
        <input className="admin-input w-full pl-9" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-[#888]" /></div>
      ) : filtered.length === 0 ? (
        <div className="border" style={{ background: "#161616", borderColor: "#222" }}><EmptyState message="Nenhuma notícia." /></div>
      ) : (
        <AdminTableShell>
          <thead>
            <tr>
              <AdminTH className="w-[60px]">Imagem</AdminTH>
              <AdminTH>Título</AdminTH>
              <AdminTH>Categoria</AdminTH>
              <AdminTH>Autor</AdminTH>
              <AdminTH>Data</AdminTH>
              <AdminTH>Publicado</AdminTH>
              <AdminTH>Destaque</AdminTH>
              <AdminTH className="text-right">Ações</AdminTH>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-[#1A1A1A]">
                <AdminTD>
                  {r.cover_image_url ? <img src={r.cover_image_url} alt="" className="h-10 w-10 object-cover" /> : <div className="h-10 w-10 bg-[#222]" />}
                </AdminTD>
                <AdminTD className="text-white font-medium">{r.title_pt}</AdminTD>
                <AdminTD><AdminBadge color="gold">{r.category}</AdminBadge></AdminTD>
                <AdminTD>{r.author ?? "—"}</AdminTD>
                <AdminTD>{new Date(r.created_at).toLocaleDateString("pt-BR")}</AdminTD>
                <AdminTD>
                  <AdminToggle checked={r.is_published} disabled={!writable}
                    onChange={(v) => toggleField.mutate({ id: r.id, field: "is_published", value: v }, { onSuccess: () => toast.success("Atualizado.") })} />
                </AdminTD>
                <AdminTD>
                  <AdminToggle checked={r.is_featured} disabled={!writable}
                    onChange={(v) => toggleField.mutate({ id: r.id, field: "is_featured", value: v }, { onSuccess: () => toast.success("Atualizado.") })} />
                </AdminTD>
                <AdminTD className="text-right">
                  {writable && (
                    <div className="inline-flex gap-1">
                      <button onClick={() => setEditing(r)} className="text-[#B8960C] p-1.5"><Pencil size={14} /></button>
                      <button onClick={() => setConfirmDelete(r)} className="text-[#C41E3A] p-1.5"><Trash2 size={14} /></button>
                    </div>
                  )}
                </AdminTD>
              </tr>
            ))}
          </tbody>
        </AdminTableShell>
      )}

      <NewsFormModal open={creating || !!editing} news={editing} onClose={() => { setCreating(false); setEditing(null); }} />
      <AdminConfirm
        open={!!confirmDelete}
        message={`Excluir "${confirmDelete?.title_pt}"?`}
        confirmLabel="Excluir"
        loading={del.isPending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && del.mutate(confirmDelete.id, {
          onSuccess: () => { toast.success("Excluído."); setConfirmDelete(null); },
        })}
      />
    </AdminSection>
  );
}

const schema = z.object({
  title_pt: z.string().trim().min(1).max(200),
  title_en: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(120),
  category: z.string().min(1),
  excerpt_pt: z.string().max(300).optional().or(z.literal("")),
  excerpt_en: z.string().max(300).optional().or(z.literal("")),
  body_pt: z.string().optional().or(z.literal("")),
  body_en: z.string().optional().or(z.literal("")),
  cover_image_url: z.string().max(500).optional().or(z.literal("")),
  author: z.string().max(120).optional().or(z.literal("")),
  published_at: z.string().optional().or(z.literal("")),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function NewsFormModal({ open, news, onClose }: { open: boolean; news: NewsRow | null; onClose: () => void }) {
  const upsert = useUpsertNews();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      title_pt: news?.title_pt ?? "",
      title_en: news?.title_en ?? "",
      slug: news?.slug ?? "",
      category: news?.category ?? CATEGORIES[0],
      excerpt_pt: news?.excerpt_pt ?? "",
      excerpt_en: news?.excerpt_en ?? "",
      body_pt: news?.body_pt ?? "",
      body_en: news?.body_en ?? "",
      cover_image_url: news?.cover_image_url ?? "",
      author: news?.author ?? "",
      published_at: news?.published_at ? news.published_at.slice(0, 16) : "",
      is_published: news?.is_published ?? false,
      is_featured: news?.is_featured ?? false,
    },
  });
  const titlePt = watch("title_pt");
  const cover = watch("cover_image_url");
  const isPublished = watch("is_published");
  const isFeatured = watch("is_featured");
  const excerptPt = watch("excerpt_pt") ?? "";
  const excerptEn = watch("excerpt_en") ?? "";

  function onSubmit(v: FormValues) {
    upsert.mutate(
      { id: news?.id, values: {
        ...v,
        excerpt_pt: v.excerpt_pt || null, excerpt_en: v.excerpt_en || null,
        body_pt: v.body_pt || null, body_en: v.body_en || null,
        cover_image_url: v.cover_image_url || null,
        author: v.author || null,
        published_at: v.published_at ? new Date(v.published_at).toISOString() : null,
      } },
      { onSuccess: () => { toast.success("Salvo!"); reset(); onClose(); }, onError: (e) => toast.error((e as Error).message) },
    );
  }

  return (
    <AdminModal open={open} onClose={onClose} title={news ? "Editar Notícia" : "Nova Notícia"} maxWidth={780}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <BilingualTabs
          pt={
            <div className="space-y-3">
              <div>
                <label className="admin-label">Título (PT)</label>
                <input className="admin-input w-full" {...register("title_pt")} onBlur={(e) => { if (!watch("slug")) setValue("slug", slugify(e.target.value)); }} />
                {errors.title_pt && <span className="text-xs text-[#C41E3A]">{errors.title_pt.message}</span>}
              </div>
              <div>
                <label className="admin-label">Resumo (PT) — {excerptPt.length}/300</label>
                <textarea className="admin-input w-full" rows={3} {...register("excerpt_pt")} />
              </div>
              <div>
                <label className="admin-label">Corpo (PT) — Markdown</label>
                <textarea className="admin-input w-full" rows={10} {...register("body_pt")} />
              </div>
            </div>
          }
          en={
            <div className="space-y-3">
              <div>
                <label className="admin-label">Title (EN)</label>
                <input className="admin-input w-full" {...register("title_en")} />
              </div>
              <div>
                <label className="admin-label">Excerpt (EN) — {excerptEn.length}/300</label>
                <textarea className="admin-input w-full" rows={3} {...register("excerpt_en")} />
              </div>
              <div>
                <label className="admin-label">Body (EN) — Markdown</label>
                <textarea className="admin-input w-full" rows={10} {...register("body_en")} />
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="admin-label">Slug</label>
            <input className="admin-input w-full" {...register("slug")} />
          </div>
          <div>
            <label className="admin-label">Categoria</label>
            <select className="admin-input w-full" {...register("category")}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="admin-label">URL da imagem de capa</label>
          <input className="admin-input w-full" {...register("cover_image_url")} />
          {cover && <img src={cover} alt="" className="mt-2 h-28 w-full object-cover border" style={{ borderColor: "#222" }} />}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="admin-label">Autor</label>
            <input className="admin-input w-full" {...register("author")} />
          </div>
          <div>
            <label className="admin-label">Data de publicação</label>
            <input type="datetime-local" className="admin-input w-full" {...register("published_at")} />
          </div>
        </div>

        <div className="flex gap-6 pt-2">
          <AdminToggle checked={isPublished} onChange={(v) => setValue("is_published", v)} label="Publicado" />
          <AdminToggle checked={isFeatured} onChange={(v) => setValue("is_featured", v)} label="Destaque" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#222" }}>
          <AdminButton variant="outline" onClick={onClose} disabled={upsert.isPending}>Cancelar</AdminButton>
          <AdminButton type="submit" disabled={upsert.isPending}>{upsert.isPending && <Loader2 size={14} className="animate-spin" />} Salvar</AdminButton>
        </div>
        <p className="text-[10px] text-[#555]">Slug atual: <span className="text-[#888]">{titlePt ? slugify(titlePt) : ""}</span></p>
      </form>
    </AdminModal>
  );
}
