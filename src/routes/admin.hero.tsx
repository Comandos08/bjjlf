/**
 * /admin/hero — hero slider editor.
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
  useAdminHero, useUpsertHero, useDeleteHero, useToggleHeroField, type HeroRow,
} from "@/lib/admin-queries";
import {
  AdminButton, AdminToggle, AdminModal, AdminConfirm, BilingualTabs, AdminSection, EmptyState,
} from "@/components/admin/AdminUI";
import { bustAnyImageUrl } from "@/lib/asset-registry";
import { ImageUploader } from "@/components/admin/ImageUploader";

export const Route = createFileRoute("/admin/hero")({
  head: () => ({ meta: [{ title: "Hero Slider — BJJLF Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: HeroAdminPage,
});

function HeroAdminPage() {
  const { role } = useAdminAuth();
  const writable = canWrite(role, "hero");
  const { data: rows = [], isLoading } = useAdminHero();
  const toggleField = useToggleHeroField();
  const del = useDeleteHero();
  const [editing, setEditing] = useState<HeroRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<HeroRow | null>(null);

  return (
    <AdminSection
      title="Hero Slider"
      actions={writable && <AdminButton onClick={() => setCreating(true)}><Plus size={16} /> Novo Slide</AdminButton>}
    >
      {isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-[#666666]" /></div>
      ) : rows.length === 0 ? (
        <div className="border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}><EmptyState message="Nenhum slide." /></div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r.id} className="border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
              <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${bustAnyImageUrl(r.image_url) ?? r.image_url})` }} />
              <div className="p-3 space-y-2">
                <div className="text-[#1A1A1A] text-sm font-medium truncate">{r.title_pt}</div>
                <div className="flex items-center justify-between text-xs text-[#999999]">
                  <span>Ordem #{r.display_order}</span>
                  <AdminToggle checked={r.is_active} disabled={!writable}
                    onChange={(v) => toggleField.mutate({ id: r.id, field: "is_active", value: v })} />
                </div>
                {writable && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setEditing(r)} className="text-[#C8A84B] p-1"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmDelete(r)} className="text-[#C8211A] p-1"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <HeroFormModal open={creating || !!editing} row={editing} onClose={() => { setCreating(false); setEditing(null); }} />
      <AdminConfirm
        open={!!confirmDelete}
        message={`Excluir slide "${confirmDelete?.title_pt}"?`}
        confirmLabel="Excluir"
        loading={del.isPending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && del.mutate(confirmDelete.id, { onSuccess: () => { toast.success("Excluído."); setConfirmDelete(null); } })}
      />
    </AdminSection>
  );
}

const schema = z.object({
  title_pt: z.string().trim().min(1).max(200),
  title_en: z.string().trim().min(1).max(200),
  subtitle_pt: z.string().max(300).optional().or(z.literal("")),
  subtitle_en: z.string().max(300).optional().or(z.literal("")),
  tag_pt: z.string().max(80).optional().or(z.literal("")),
  tag_en: z.string().max(80).optional().or(z.literal("")),
  badge1_label: z.string().max(80).optional().or(z.literal("")),
  badge2_label: z.string().max(80).optional().or(z.literal("")),
  image_url: z.string().min(1, "Imagem obrigatória"),
  cta_primary_url: z.string().max(500).optional().or(z.literal("")),
  cta_secondary_url: z.string().max(500).optional().or(z.literal("")),
  display_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function HeroFormModal({ open, row, onClose }: { open: boolean; row: HeroRow | null; onClose: () => void }) {
  const upsert = useUpsertHero();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      title_pt: row?.title_pt ?? "",
      title_en: row?.title_en ?? "",
      subtitle_pt: row?.subtitle_pt ?? "",
      subtitle_en: row?.subtitle_en ?? "",
      tag_pt: row?.tag_pt ?? "",
      tag_en: row?.tag_en ?? "",
      badge1_label: row?.badge1_label ?? "",
      badge2_label: row?.badge2_label ?? "",
      image_url: row?.image_url ?? "",
      cta_primary_url: row?.cta_primary_url ?? "",
      cta_secondary_url: row?.cta_secondary_url ?? "",
      display_order: row?.display_order ?? 0,
      is_active: row?.is_active ?? true,
    },
  });
  const img = watch("image_url");
  const isActive = watch("is_active");

  function onSubmit(v: FormValues) {
    upsert.mutate(
      { id: row?.id, values: {
        ...v,
        subtitle_pt: v.subtitle_pt || null, subtitle_en: v.subtitle_en || null,
        tag_pt: v.tag_pt || null, tag_en: v.tag_en || null,
        badge1_label: v.badge1_label || null, badge2_label: v.badge2_label || null,
        cta_primary_url: v.cta_primary_url || null, cta_secondary_url: v.cta_secondary_url || null,
      } },
      { onSuccess: () => { toast.success("Salvo!"); reset(); onClose(); }, onError: (e) => toast.error((e as Error).message) },
    );
  }

  return (
    <AdminModal open={open} onClose={onClose} title={row ? "Editar Slide" : "Novo Slide"} maxWidth={720}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <BilingualTabs
          pt={
            <div className="space-y-3">
              <div><label className="admin-label">Título (PT)</label><input className="admin-input w-full" {...register("title_pt")} /></div>
              <div><label className="admin-label">Subtítulo (PT)</label><textarea className="admin-input w-full" rows={2} {...register("subtitle_pt")} /></div>
              <div><label className="admin-label">Tag (PT) — pílula vermelha</label><input className="admin-input w-full" {...register("tag_pt")} /></div>
            </div>
          }
          en={
            <div className="space-y-3">
              <div><label className="admin-label">Title (EN)</label><input className="admin-input w-full" {...register("title_en")} /></div>
              <div><label className="admin-label">Subtitle (EN)</label><textarea className="admin-input w-full" rows={2} {...register("subtitle_en")} /></div>
              <div><label className="admin-label">Tag (EN)</label><input className="admin-input w-full" {...register("tag_en")} /></div>
            </div>
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <div><label className="admin-label">Badge 1</label><input className="admin-input w-full" {...register("badge1_label")} /></div>
          <div><label className="admin-label">Badge 2</label><input className="admin-input w-full" {...register("badge2_label")} /></div>
        </div>
        <div>
          <ImageUploader
            label="Imagem do slide"
            folder="hero"
            value={img}
            onChange={(url) => setValue("image_url", url, { shouldValidate: true })}
            previewClassName="mt-2 h-44 w-full object-cover border"
          />
          {errors.image_url && <span className="text-xs text-[#C8211A]">{errors.image_url.message}</span>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="admin-label">URL botão principal</label><input className="admin-input w-full" {...register("cta_primary_url")} /></div>
          <div><label className="admin-label">URL botão secundário</label><input className="admin-input w-full" {...register("cta_secondary_url")} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3 items-end">
          <div><label className="admin-label">Ordem</label><input type="number" className="admin-input w-full" {...register("display_order")} /></div>
          <AdminToggle checked={isActive} onChange={(v) => setValue("is_active", v)} label="Ativo" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#E5E5E5" }}>
          <AdminButton variant="outline" onClick={onClose}>Cancelar</AdminButton>
          <AdminButton type="submit" disabled={upsert.isPending}>{upsert.isPending && <Loader2 size={14} className="animate-spin" />} Salvar</AdminButton>
        </div>
      </form>
    </AdminModal>
  );
}
