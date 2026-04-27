// Helpers para exibir validade da carteirinha de forma consistente em
// /my-card e /verify/{id}.

export type ValidityState =
  | { kind: "none" }
  | { kind: "expired"; daysOverdue: number }
  | { kind: "critical"; daysLeft: number } // < 30 dias
  | { kind: "warning"; daysLeft: number } // 30-90 dias
  | { kind: "ok"; daysLeft: number }; // > 90 dias

export function computeValidity(validUntil: string | null | undefined): ValidityState {
  if (!validUntil) return { kind: "none" };
  const end = new Date(validUntil);
  if (Number.isNaN(end.getTime())) return { kind: "none" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffMs = end.getTime() - today.getTime();
  const days = Math.round(diffMs / 86_400_000);
  if (days < 0) return { kind: "expired", daysOverdue: Math.abs(days) };
  if (days < 30) return { kind: "critical", daysLeft: days };
  if (days <= 90) return { kind: "warning", daysLeft: days };
  return { kind: "ok", daysLeft: days };
}

export function formatValidUntil(validUntil: string | null | undefined): string {
  if (!validUntil) return "—";
  const d = new Date(validUntil);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
