/**
 * /admin/benefits — CRUD for the "Clube de Vantagens" member benefits marketplace.
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
  useAdminBenefits,
  useUpsertBenefit,
  useDeleteBenefit,
  useToggleBenefitField,
  type BenefitRow,
} from "@/lib/admin-queries";
import {
  AdminButton,
  AdminToggle,
  AdminBadge,
  AdminModal,
  AdminConfirm,
  AdminSection,
  AdminTableShell,
  AdminTH,
  AdminTD,
  EmptyState,
} from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/benefits")({
  head: () => ({ meta: [{ title: "Benefícios — BJJLF Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: BenefitsAdminPage,
});

const CATEGORIES: { value: string; label: string }[] = [
  { value: "courses", label: "Cursos e Treinamentos" },
  { value: "products", label: "Produtos" },
  { value: "health", label: "Saúde e Bem-estar" },
  { value: "services", label: "Serviços" },
  { value: "partners", label: "Parceiros" },
];

function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function BenefitsAdminPage() {
  const { role } = useAdminAuth();
  const writable = canWrite(role, "academies");
  const { data: rows = [], isLoading } = useAdminBenefits();
  const toggleField = useToggleBenefitField();
  const del = useDeleteBenefit();
  const [editing, setEditing] = useState<BenefitRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<BenefitRow | null>(null);

  return (
    <AdminSection
      title="Benefícios / Clube de Vantagens"
      actions={
        writable && (
          <AdminButton onClick={() => setCreating(true)}>
            <Plus size={16} /> Novo Benefício
          </AdminButton>
        )
      }
    >
      {isLoading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="animate-spin text-[#666666]" />
        </div>
      ) : rows.length === 0 ? (
        <div className="border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
          <EmptyState message="Nenhum benefício cadastrado." />
        </div>
      ) : (
        <AdminTableShell>
          <thead>
            <tr>
              <AdminTH className="w-[80px]">Imagem</AdminTH>
              <AdminTH>Nome</AdminTH>
              <AdminTH>Categoria</AdminTH>
              <AdminTH>Desconto</AdminTH>
              <AdminTH className="w-[90px]">Destaque</AdminTH>
              <AdminTH className="w-[90px]">Ativo</AdminTH>
              <AdminTH className="w-[80px]">Ordem</AdminTH>
              {writable && <AdminTH className="w-[100px]">Ações</AdminTH>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <AdminTD>
                  {r.image_url ? (
                    <img src={r.image_url} alt="" className="h-12 w-12 object-cover border" style={{ borderColor: "#E5E5E5" }} />
                  ) : (
                    <div className="h-12 w-12 bg-[#F5F5F5] border" style={{ borderColor: "#E5E5E5" }} />
                  )}
                </AdminTD>
                <AdminTD>
                  <div className="font-medium">{r.name}</div>
                  {r.value_label && <div className="text-xs text-[#999999]">{r.value_label}</div>}
                </AdminTD>
                <AdminTD>
                  <AdminBadge color="gray">{categoryLabel(r.category)}</AdminBadge>
                </AdminTD>
                <AdminTD>
                  {r.discount_label ? <AdminBadge color="red">{r.discount_label}</AdminBadge> : <span className="text-[#999999]">—</span>}
                </AdminTD>
                <AdminTD>
                  <AdminToggle
                    checked={r.is_featured}
                    disabled={!writable || toggleField.isPending}
                    onChange={(v) =>
                      toggleField.mutate(
                        { id: r.id, field: "is_featured", value: v },
                        {
                          onSuccess: () => toast.success(v ? "Em destaque." : "Removido do destaque."),
                          onError: (e) => toast.error((e as Error).message),
                        },
                      )
                    }
                  />
                </AdminTD>
                <AdminTD>
                  <AdminToggle
                    checked={r.is_active}
                    disabled={!writable || toggleField.isPending}
                    onChange={(v) =>
                      toggleField.mutate(
                        { id: r.id, field: "is_active", value: v },
                        {
                          onSuccess: () => toast.success(v ? "Ativado." : "Desativado."),
                          onError: (e) => toast.error((e as Error).message),
                        },
                      )
                    }
                  />
                </AdminTD>
                <AdminTD>#{r.sort_order}</AdminTD>
                {writable && (
                  <AdminTD>
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(r)} className="text-[#C8A84B] p-1" aria-label="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setConfirmDelete(r)} className="text-[#C8211A] p-1" aria-label="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </AdminTD>
                )}
              </tr>
            ))}
          </tbody>
        </AdminTableShell>
      )}

      <BenefitFormModal
        open={creating || !!editing}
        row={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
      <AdminConfirm
        open={!!confirmDelete}
        message={`Excluir "${confirmDelete?.name}"?`}
        confirmLabel="Excluir"
        loading={del.isPending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() =>
          confirmDelete &&
          del.mutate(confirmDelete.id, {
            onSuccess: () => {
              toast.success("Excluído.");
              setConfirmDelete(null);
            },
            onError: (e) => toast.error((e as Error).message),
          })
        }
      />
    </AdminSection>
  );
}

const schema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(200),
  description: z.string().max(2000),
  image_url: z.string().max(500),
  category: z.enum(["courses", "products", "health", "services", "partners"]),
  value_label: z.string().max(60),
  discount_label: z.string().max(60),
  external_link: z.string().max(500),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0),
});
type FormValues = z.infer<typeof schema>;

function BenefitFormModal({ open, row, onClose }: { open: boolean; row: BenefitRow | null; onClose: () => void }) {
  const upsert = useUpsertBenefit();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: row?.name ?? "",
      description: row?.description ?? "",
      image_url: row?.image_url ?? "",
      category: (row?.category as FormValues["category"]) ?? "courses",
      value_label: row?.value_label ?? "",
      discount_label: row?.discount_label ?? "",
      external_link: row?.external_link ?? "",
      is_featured: row?.is_featured ?? false,
      is_active: row?.is_active ?? true,
      sort_order: row?.sort_order ?? 0,
    },
  });

  const isFeatured = watch("is_featured");
  const isActive = watch("is_active");
  const imageUrl = watch("image_url");

  function onSubmit(v: FormValues) {
    const values = {
      name: v.name,
      description: v.description || null,
      image_url: v.image_url || null,
      category: v.category,
      value_label: v.value_label || null,
      discount_label: v.discount_label || null,
      external_link: v.external_link || null,
      is_featured: v.is_featured,
      is_active: v.is_active,
      sort_order: v.sort_order,
    };
    upsert.mutate(
      { id: row?.id, values },
      {
        onSuccess: () => {
          toast.success("Salvo!");
          reset();
          onClose();
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  }

  return (
    <AdminModal open={open} onClose={onClose} title={row ? "Editar Benefício" : "Novo Benefício"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="admin-label">Nome</label>
          <input className="admin-input w-full" {...register("name")} />
          {errors.name && <span className="text-xs text-[#C8211A]">{errors.name.message}</span>}
        </div>

        <div>
          <label className="admin-label">Descrição</label>
          <textarea className="admin-input w-full min-h-[80px]" {...register("description")} />
        </div>

        <div>
          <label className="admin-label">URL da Imagem</label>
          <input className="admin-input w-full" {...register("image_url")} placeholder="https://..." />
          {imageUrl && (
            <img src={imageUrl} alt="" className="mt-2 h-32 w-32 object-cover border" style={{ borderColor: "#E5E5E5" }} />
          )}
        </div>

        <div>
          <label className="admin-label">Categoria</label>
          <select className="admin-input w-full" {...register("category")}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="admin-label">Valor (display)</label>
            <input className="admin-input w-full" {...register("value_label")} placeholder="Ex: R$ 97, Grátis" />
          </div>
          <div>
            <label className="admin-label">Desconto (display)</label>
            <input className="admin-input w-full" {...register("discount_label")} placeholder="Ex: 30% OFF, PREÇO ESPECIAL" />
          </div>
        </div>

        <div>
          <label className="admin-label">Link Externo</label>
          <input className="admin-input w-full" {...register("external_link")} placeholder="https://..." />
        </div>

        <div className="grid grid-cols-3 gap-3 items-end">
          <div>
            <label className="admin-label">Ordem</label>
            <input type="number" className="admin-input w-full" {...register("sort_order")} />
          </div>
          <AdminToggle
            checked={isFeatured}
            onChange={(v) => setValue("is_featured", v)}
            label="Destaque"
          />
          <AdminToggle checked={isActive} onChange={(v) => setValue("is_active", v)} label="Ativo" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#E5E5E5" }}>
          <AdminButton variant="outline" onClick={onClose}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" disabled={upsert.isPending}>
            {upsert.isPending && <Loader2 size={14} className="animate-spin" />} Salvar
          </AdminButton>
        </div>
      </form>
    </AdminModal>
  );
}
