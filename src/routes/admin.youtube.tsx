/**
 * /admin/youtube — card grid CRUD with auto-extracted video ID + thumbnail.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAdminAuth, canWrite } from "@/lib/admin-auth";
import {
  useAdminYoutube, useUpsertYoutube, useDeleteYoutube, useToggleYoutubeField, type YoutubeRow,
} from "@/lib/admin-queries";
import {
  AdminButton, AdminToggle, AdminModal, AdminConfirm, BilingualTabs, AdminSection, EmptyState,
} from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/youtube")({
  head: () => ({ meta: [{ title: "YouTube — BJJLF Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: YoutubeAdminPage,
});

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function YoutubeAdminPage() {
  const { role } = useAdminAuth();
  const writable = canWrite(role, "youtube");
  const { data: rows = [], isLoading } = useAdminYoutube();
  const toggleField = useToggleYoutubeField();
  const del = useDeleteYoutube();
  const [editing, setEditing] = useState<YoutubeRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<YoutubeRow | null>(null);

  return (
    <AdminSection
      title="YouTube"
      actions={writable && <AdminButton onClick={() => setCreating(true)}><Plus size={16} /> Novo Vídeo</AdminButton>}
    >
      {isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-[#888]" /></div>
      ) : rows.length === 0 ? (
        <div className="border" style={{ background: "#161616", borderColor: "#222" }}><EmptyState message="Nenhum vídeo." /></div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r.id} className="border" style={{ background: "#161616", borderColor: "#222" }}>
              <img src={r.thumbnail_url ?? `https://img.youtube.com/vi/${r.youtube_id}/hqdefault.jpg`} alt="" className="w-full aspect-video object-cover" />
              <div className="p-3 space-y-2">
                <div className="text-white text-sm font-medium truncate">{r.title_pt}</div>
                <div className="flex items-center justify-between text-xs text-[#666]">
                  <span>Ordem #{r.display_order}</span>
                  <AdminToggle checked={r.is_active} disabled={!writable}
                    onChange={(v) => toggleField.mutate({ id: r.id, field: "is_active", value: v })} />
                </div>
                {writable && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setEditing(r)} className="text-[#B8960C] p-1"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmDelete(r)} className="text-[#C41E3A] p-1"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <YoutubeFormModal open={creating || !!editing} row={editing} onClose={() => { setCreating(false); setEditing(null); }} />
      <AdminConfirm
        open={!!confirmDelete}
        message={`Excluir "${confirmDelete?.title_pt}"?`}
        confirmLabel="Excluir"
        loading={del.isPending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && del.mutate(confirmDelete.id, { onSuccess: () => { toast.success("Excluído."); setConfirmDelete(null); } })}
      />
    </AdminSection>
  );
}

const schema = z.object({
  youtube_url: z.string().min(1, "URL obrigatória").refine((v) => extractYoutubeId(v) !== null, "URL inválida"),
  title_pt: z.string().trim().min(1).max(200),
  title_en: z.string().trim().min(1).max(200),
  display_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function YoutubeFormModal({ open, row, onClose }: { open: boolean; row: YoutubeRow | null; onClose: () => void }) {
  const upsert = useUpsertYoutube();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      youtube_url: row?.youtube_url ?? "",
      title_pt: row?.title_pt ?? "",
      title_en: row?.title_en ?? "",
      display_order: row?.display_order ?? 0,
      is_active: row?.is_active ?? true,
    },
  });
  const url = watch("youtube_url") ?? "";
  const isActive = watch("is_active");
  const videoId = extractYoutubeId(url);

  function onSubmit(v: FormValues) {
    const id = extractYoutubeId(v.youtube_url);
    if (!id) { toast.error("URL inválida."); return; }
    upsert.mutate(
      { id: row?.id, values: { ...v, youtube_id: id, thumbnail_url: `https://img.youtube.com/vi/${id}/hqdefault.jpg` } },
      { onSuccess: () => { toast.success("Salvo!"); reset(); onClose(); }, onError: (e) => toast.error((e as Error).message) },
    );
  }

  return (
    <AdminModal open={open} onClose={onClose} title={row ? "Editar Vídeo" : "Novo Vídeo"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="admin-label">URL do YouTube</label>
          <input className="admin-input w-full" {...register("youtube_url")} placeholder="https://youtube.com/watch?v=..." />
          {errors.youtube_url && <span className="text-xs text-[#C41E3A]">{errors.youtube_url.message}</span>}
          {videoId && <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt="" className="mt-2 w-full aspect-video object-cover border" style={{ borderColor: "#222" }} />}
        </div>
        <BilingualTabs
          pt={<div><label className="admin-label">Título (PT)</label><input className="admin-input w-full" {...register("title_pt")} /></div>}
          en={<div><label className="admin-label">Title (EN)</label><input className="admin-input w-full" {...register("title_en")} /></div>}
        />
        <div className="grid grid-cols-2 gap-3 items-end">
          <div><label className="admin-label">Ordem de exibição</label><input type="number" className="admin-input w-full" {...register("display_order")} /></div>
          <AdminToggle checked={isActive} onChange={(v) => setValue("is_active", v)} label="Ativo" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#222" }}>
          <AdminButton variant="outline" onClick={onClose}>Cancelar</AdminButton>
          <AdminButton type="submit" disabled={upsert.isPending}>{upsert.isPending && <Loader2 size={14} className="animate-spin" />} Salvar</AdminButton>
        </div>
      </form>
    </AdminModal>
  );
}
