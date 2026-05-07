/**
 * /admin/events — list + modal form CRUD for events.
 *
 * - Search by name (PT or EN, case-insensitive client-side filter).
 * - Inline "show on home" toggle calls a small mutation.
 * - Edit / Delete action buttons gated by canWrite("events").
 * - Modal form covers all event fields including bilingual names + image preview.
 */
import { createFileRoute } from "@tanstack/react-router";
import { bustStorageUrl } from "@/lib/bust-storage-url";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, PowerOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAdminAuth, canWrite } from "@/lib/admin-auth";
import {
  useAdminEvents,
  useUpsertEvent,
  useDeleteEvent,
  useToggleEventField,
  useToggleEventStatus,
  useDeactivateAllEvents,
  type EventRow,
} from "@/lib/admin-queries";
import {
  AdminButton,
  AdminToggle,
  AdminBadge,
  AdminModal,
  AdminConfirm,
  BilingualTabs,
  AdminSection,
  AdminTableShell,
  AdminTH,
  AdminTD,
  EmptyState,
} from "@/components/admin/AdminUI";
import { ImageUploader } from "@/components/admin/ImageUploader";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Eventos — BJJLF Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: EventsAdminPage,
});

const TYPE_LABELS: Record<string, { label: string; color: "green" | "gold" | "red" | "blue" | "purple" | "gray" }> = {
  gi: { label: "GI", color: "green" },
  no_gi: { label: "NO-GI", color: "gold" },
  gi_no_gi: { label: "GI & NO-GI", color: "red" },
  kids: { label: "KIDS", color: "blue" },
  master: { label: "MASTER", color: "purple" },
  seminar: { label: "SEMINÁRIO", color: "gray" },
  course: { label: "CURSO", color: "red" },
};

const STATUS_LABELS: Record<string, { label: string; color: "blue" | "orange" | "gray" | "red" }> = {
  upcoming: { label: "Próximo", color: "blue" },
  ongoing: { label: "Em Andamento", color: "orange" },
  completed: { label: "Concluído", color: "gray" },
  cancelled: { label: "Cancelado", color: "red" },
};

const PER_PAGE = 10;

function EventsAdminPage() {
  const { role } = useAdminAuth();
  const writable = canWrite(role, "events");
  const { data: events = [], isLoading } = useAdminEvents();
  const toggleField = useToggleEventField();
  const toggleStatus = useToggleEventStatus();
  const deactivateAll = useDeactivateAllEvents();
  const deleteEvent = useDeleteEvent();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<EventRow | null>(null);
  const [confirmDeactivateAll, setConfirmDeactivateAll] = useState(false);

  const activeCount = events.filter((e) => e.status !== "cancelled").length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      if (q && !e.name_pt.toLowerCase().includes(q) && !e.name_en.toLowerCase().includes(q)) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (featuredFilter === "featured" && !e.is_featured) return false;
      if (featuredFilter === "not_featured" && e.is_featured) return false;
      if (dateFrom && e.event_date < dateFrom) return false;
      if (dateTo && e.event_date > dateTo) return false;
      return true;
    });
  }, [events, search, statusFilter, featuredFilter, dateFrom, dateTo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setFeaturedFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }
  const hasActiveFilter =
    search !== "" || statusFilter !== "all" || featuredFilter !== "all" || dateFrom !== "" || dateTo !== "";

  return (
    <AdminSection
      title="Eventos"
      actions={
        writable && (
          <div className="flex gap-2">
            <AdminButton
              variant="outline"
              disabled={activeCount === 0 || deactivateAll.isPending}
              onClick={() => setConfirmDeactivateAll(true)}
            >
              <PowerOff size={16} /> Desativar todos ({activeCount})
            </AdminButton>
            <AdminButton onClick={() => setCreating(true)}>
              <Plus size={16} /> Novo Evento
            </AdminButton>
          </div>
        )
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        <div className="relative md:col-span-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
          <input
            className="admin-input w-full pl-9"
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="admin-input md:col-span-2"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="all">Todos os status</option>
          <option value="upcoming">Próximo</option>
          <option value="ongoing">Em Andamento</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <select
          className="admin-input md:col-span-2"
          value={featuredFilter}
          onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }}
        >
          <option value="all">Destaque: todos</option>
          <option value="featured">Em destaque</option>
          <option value="not_featured">Sem destaque</option>
        </select>
        <input
          type="date"
          className="admin-input md:col-span-2"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          aria-label="Data inicial"
        />
        <input
          type="date"
          className="admin-input md:col-span-2"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          aria-label="Data final"
        />
      </div>
      {hasActiveFilter && (
        <div className="flex items-center justify-between text-xs text-[#999999]">
          <span>{filtered.length} resultado(s) com filtros aplicados</span>
          <button onClick={resetFilters} className="text-[#C8211A] hover:underline">Limpar filtros</button>
        </div>
      )}

      {isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-[#666666]" /></div>
      ) : filtered.length === 0 ? (
        <div className="border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
          <EmptyState message="Nenhum evento encontrado." />
        </div>
      ) : (
        <>
          <AdminTableShell>
            <thead>
              <tr>
                <AdminTH className="w-[60px]">Imagem</AdminTH>
                <AdminTH>Nome</AdminTH>
                <AdminTH>Data</AdminTH>
                <AdminTH>Local</AdminTH>
                <AdminTH>Tipo</AdminTH>
                <AdminTH>Status</AdminTH>
                <AdminTH>Ativo</AdminTH>
                <AdminTH>Home</AdminTH>
                <AdminTH className="text-right">Ações</AdminTH>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((e) => {
                const t = TYPE_LABELS[e.event_type] ?? { label: e.event_type.toUpperCase(), color: "gray" as const };
                const s = STATUS_LABELS[e.status] ?? { label: e.status, color: "gray" as const };
                return (
                  <tr key={e.id} className="hover:bg-[#F5F5F5]">
                    <AdminTD>
                      {e.image_url ? (
                        <img src={bustStorageUrl(e.image_url, e.created_at) ?? e.image_url} alt="" className="h-10 w-10 object-cover" />
                      ) : (
                        <div className="h-10 w-10 bg-[#E5E5E5]" />
                      )}
                    </AdminTD>
                    <AdminTD className="text-[#1A1A1A] font-medium">{e.name_pt}</AdminTD>
                    <AdminTD>{new Date(e.event_date).toLocaleDateString("pt-BR")}</AdminTD>
                    <AdminTD>{e.city}, {e.country_code}</AdminTD>
                    <AdminTD><AdminBadge color={t.color}>{t.label}</AdminBadge></AdminTD>
                    <AdminTD><AdminBadge color={s.color}>{s.label}</AdminBadge></AdminTD>
                    <AdminTD>
                      <AdminToggle
                        checked={e.is_active}
                        disabled={!writable}
                        onChange={(v) =>
                          toggleField.mutate(
                            { id: e.id, field: "is_active", value: v },
                            { onSuccess: () => toast.success(v ? "Evento ativado." : "Evento desativado.") },
                          )
                        }
                      />
                    </AdminTD>
                    <AdminTD>
                      <AdminToggle
                        checked={e.show_on_home}
                        disabled={!writable}
                        onChange={(v) =>
                          toggleField.mutate(
                            { id: e.id, field: "show_on_home", value: v },
                            { onSuccess: () => toast.success("Atualizado.") },
                          )
                        }
                      />
                    </AdminTD>
                    <AdminTD className="text-right">
                      {writable && (
                        <div className="inline-flex gap-1">
                          <button onClick={() => setEditing(e)} className="text-[#C8A84B] hover:bg-[#1f1a08] p-1.5" aria-label="Editar">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setConfirmDelete(e)} className="text-[#C8211A] hover:bg-[#1f0a0e] p-1.5" aria-label="Excluir">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </AdminTD>
                  </tr>
                );
              })}
            </tbody>
          </AdminTableShell>

          {pageCount > 1 && (
            <div className="flex items-center justify-between text-xs text-[#999999]">
              <span>{filtered.length} eventos · página {page} de {pageCount}</span>
              <div className="flex gap-1">
                <AdminButton variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</AdminButton>
                <AdminButton variant="outline" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>Próxima</AdminButton>
              </div>
            </div>
          )}
        </>
      )}

      <EventFormModal
        open={creating || !!editing}
        event={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
      />

      <AdminConfirm
        open={!!confirmDelete}
        message={`Excluir o evento "${confirmDelete?.name_pt}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleteEvent.isPending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          deleteEvent.mutate(confirmDelete.id, {
            onSuccess: () => { toast.success("Evento excluído."); setConfirmDelete(null); },
            onError: (e) => toast.error(`Erro: ${(e as Error).message}`),
          });
        }}
      />

      <AdminConfirm
        open={confirmDeactivateAll}
        message={`Desativar todos os ${activeCount} eventos ativos? Eles não aparecerão mais em /events até serem reativados.`}
        confirmLabel="Desativar todos"
        loading={deactivateAll.isPending}
        onCancel={() => setConfirmDeactivateAll(false)}
        onConfirm={() => {
          deactivateAll.mutate(undefined, {
            onSuccess: (n) => { toast.success(`${n} evento(s) desativado(s).`); setConfirmDeactivateAll(false); },
            onError: (e) => toast.error(`Erro: ${(e as Error).message}`),
          });
        }}
      />
    </AdminSection>
  );
}

/* ----------------------- Form modal ----------------------- */

const formSchema = z.object({
  name_pt: z.string().trim().min(1, "Obrigatório").max(200),
  name_en: z.string().trim().min(1, "Obrigatório").max(200),
  event_date: z.string().min(1, "Obrigatório"),
  end_date: z.string().optional().or(z.literal("")),
  city: z.string().trim().min(1, "Obrigatório").max(120),
  country: z.string().trim().min(1, "Obrigatório").max(120),
  country_code: z.string().trim().length(2, "2 letras").toUpperCase(),
  event_type: z.string().min(1),
  status: z.string().min(1),
  image_url: z.string().trim().max(500).optional().or(z.literal("")),
  registration_url: z.string().trim().max(500).optional().or(z.literal("")),
  show_on_home: z.boolean(),
  is_featured: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

function defaultsFromEvent(e: EventRow | null): FormValues {
  return {
    name_pt: e?.name_pt ?? "",
    name_en: e?.name_en ?? "",
    event_date: e?.event_date ?? "",
    end_date: e?.end_date ?? "",
    city: e?.city ?? "",
    country: e?.country ?? "",
    country_code: e?.country_code ?? "",
    event_type: e?.event_type ?? "gi",
    status: e?.status ?? "upcoming",
    image_url: e?.image_url ?? "",
    registration_url: e?.registration_url ?? "",
    show_on_home: e?.show_on_home ?? true,
    is_featured: e?.is_featured ?? false,
  };
}

function EventFormModal({
  open,
  event,
  onClose,
}: {
  open: boolean;
  event: EventRow | null;
  onClose: () => void;
}) {
  const upsert = useUpsertEvent();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: defaultsFromEvent(event),
  });

  const imageUrl = watch("image_url");
  const showOnHome = watch("show_on_home");
  const isFeatured = watch("is_featured");

  function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      end_date: values.end_date || null,
      image_url: values.image_url || null,
      registration_url: values.registration_url || null,
    };
    upsert.mutate(
      { id: event?.id, values: payload },
      {
        onSuccess: () => {
          toast.success("Salvo com sucesso!");
          reset();
          onClose();
        },
        onError: (e) => toast.error(`Erro: ${(e as Error).message}`),
      },
    );
  }

  return (
    <AdminModal open={open} onClose={onClose} title={event ? "Editar Evento" : "Novo Evento"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <BilingualTabs
          pt={
            <div>
              <label className="admin-label">Nome (PT)</label>
              <input className="admin-input w-full" {...register("name_pt")} />
              {errors.name_pt && <span className="text-xs text-[#C8211A]">{errors.name_pt.message}</span>}
            </div>
          }
          en={
            <div>
              <label className="admin-label">Nome (EN)</label>
              <input className="admin-input w-full" {...register("name_en")} />
              {errors.name_en && <span className="text-xs text-[#C8211A]">{errors.name_en.message}</span>}
            </div>
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="admin-label">Data início</label>
            <input type="date" className="admin-input w-full" {...register("event_date")} />
          </div>
          <div>
            <label className="admin-label">Data fim (opcional)</label>
            <input type="date" className="admin-input w-full" {...register("end_date")} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="admin-label">Cidade</label>
            <input className="admin-input w-full" {...register("city")} />
          </div>
          <div className="col-span-1">
            <label className="admin-label">País</label>
            <input className="admin-input w-full" {...register("country")} />
          </div>
          <div className="col-span-1">
            <label className="admin-label">Código (2)</label>
            <input className="admin-input w-full uppercase" maxLength={2} {...register("country_code")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="admin-label">Tipo</label>
            <select className="admin-input w-full" {...register("event_type")}>
              <option value="gi">Gi (Campeonato)</option>
              <option value="no_gi">No-Gi (Campeonato)</option>
              <option value="gi_no_gi">Gi &amp; No-Gi (Campeonato)</option>
              <option value="kids">Kids (Campeonato)</option>
              <option value="master">Master (Campeonato)</option>
              <option value="seminar">Seminário</option>
              <option value="course">Curso</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Status</label>
            <select className="admin-input w-full" {...register("status")}>
              <option value="upcoming">Próximo</option>
              <option value="ongoing">Em Andamento</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        <ImageUploader
          label="Imagem do evento"
          folder="events"
          value={imageUrl ?? ""}
          onChange={(url) => setValue("image_url", url)}
          previewClassName="mt-2 h-20 w-full object-cover border"
        />

        <div>
          <label className="admin-label">URL de inscrição</label>
          <input className="admin-input w-full" {...register("registration_url")} placeholder="https://..." />
        </div>

        <div className="flex gap-6 pt-2">
          <AdminToggle checked={showOnHome} onChange={(v) => setValue("show_on_home", v)} label="Mostrar na home" />
          <AdminToggle checked={isFeatured} onChange={(v) => setValue("is_featured", v)} label="Destaque" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#E5E5E5" }}>
          <AdminButton variant="outline" onClick={onClose} disabled={upsert.isPending}>Cancelar</AdminButton>
          <AdminButton type="submit" disabled={upsert.isPending}>
            {upsert.isPending && <Loader2 size={14} className="animate-spin" />} Salvar
          </AdminButton>
        </div>
      </form>
    </AdminModal>
  );
}
