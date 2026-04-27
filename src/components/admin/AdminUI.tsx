/**
 * Shared primitives for the admin panel.
 *
 * - AdminButton: square (border-radius 0) buttons in red/outline/ghost variants.
 * - AdminToggle: labeled switch with green-on / gray-off colors.
 * - AdminBadge: small uppercase pill, used for status/category/role labels.
 * - AdminModal: centered dialog with a dark card and an X button.
 * - AdminConfirm: small confirm dialog with red "Confirmar" + outlined cancel.
 * - BilingualTabs: PT / EN tab switcher (renders one of the two children).
 * - AdminSection: page header (title + optional right-side actions).
 *
 * Everything here is intentionally low-level — feature pages compose them.
 */
import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Button ---------- */
export function AdminButton({
  children,
  variant = "primary",
  className,
  type = "button",
  ...rest
}: {
  variant?: "primary" | "outline" | "ghost" | "danger";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<string, string> = {
    primary: "bg-[#C41E3A] text-white hover:bg-[#a8152e]",
    danger: "bg-[#C41E3A] text-white hover:bg-[#a8152e]",
    outline: "bg-transparent text-white border border-[#333] hover:border-[#555] hover:bg-[#1a1a1a]",
    ghost: "bg-transparent text-[#888] hover:text-white hover:bg-[#1a1a1a]",
  };
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      style={{ borderRadius: 0 }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Toggle ---------- */
export function AdminToggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <label className={cn("inline-flex items-center gap-2", disabled && "opacity-50 cursor-not-allowed")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          checked ? "bg-[#166534]" : "bg-[#333]",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-[2px]",
          )}
        />
      </button>
      {label && <span className="text-sm text-[#CCC]">{label}</span>}
    </label>
  );
}

/* ---------- Badge ---------- */
export function AdminBadge({
  children,
  color = "gray",
  className,
}: {
  children: ReactNode;
  color?: "red" | "gold" | "green" | "blue" | "orange" | "purple" | "gray";
  className?: string;
}) {
  const colors: Record<string, string> = {
    red: "bg-[#C41E3A]/15 text-[#ef4d6c] border-[#C41E3A]/40",
    gold: "bg-[#B8960C]/15 text-[#E5C547] border-[#B8960C]/40",
    green: "bg-[#166534]/20 text-[#4ade80] border-[#166534]/50",
    blue: "bg-[#1e40af]/20 text-[#60a5fa] border-[#1e40af]/50",
    orange: "bg-[#9a3412]/20 text-[#fb923c] border-[#9a3412]/50",
    purple: "bg-[#6b21a8]/20 text-[#c084fc] border-[#6b21a8]/50",
    gray: "bg-[#222] text-[#999] border-[#333]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border",
        colors[color],
        className,
      )}
      style={{ borderRadius: 0 }}
    >
      {children}
    </span>
  );
}

/* ---------- Modal ---------- */
export function AdminModal({
  open,
  onClose,
  title,
  children,
  maxWidth = 640,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: number;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-h-[90vh] overflow-auto border"
        style={{ background: "#111111", borderColor: "#222", maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#222" }}>
          <h2 className="text-white font-bold uppercase text-lg" style={{ fontFamily: "Barlow Condensed" }}>
            {title}
          </h2>
          <button onClick={onClose} className="text-[#888] hover:text-white" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Confirm dialog ---------- */
export function AdminConfirm({
  open,
  title = "Confirmar",
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Confirmar",
  loading = false,
}: {
  open: boolean;
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[420px] border"
        style={{ background: "#111111", borderColor: "#222" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: "#222" }}>
          <h2 className="text-white font-bold uppercase text-base" style={{ fontFamily: "Barlow Condensed" }}>
            {title}
          </h2>
        </div>
        <div className="p-6">
          <p className="text-[#CCC] text-sm">{message}</p>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <AdminButton variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </AdminButton>
          <AdminButton variant="danger" onClick={onConfirm} disabled={loading}>
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

/* ---------- Bilingual tabs ---------- */
export function BilingualTabs({
  pt,
  en,
}: {
  pt: ReactNode;
  en: ReactNode;
}) {
  const [tab, setTab] = useState<"pt" | "en">("pt");
  return (
    <div>
      <div className="flex border-b mb-3" style={{ borderColor: "#222" }}>
        {(["pt", "en"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-px transition-colors",
              tab === t
                ? "text-white border-[#C41E3A]"
                : "text-[#666] border-transparent hover:text-[#999]",
            )}
          >
            {t === "pt" ? "🇧🇷 PT" : "🇺🇸 EN"}
          </button>
        ))}
      </div>
      <div className={tab === "pt" ? "block" : "hidden"}>{pt}</div>
      <div className={tab === "en" ? "block" : "hidden"}>{en}</div>
    </div>
  );
}

/* ---------- Page section header ---------- */
export function AdminSection({
  title,
  actions,
  children,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      {(title || actions) && (
        <div className="flex items-center justify-between">
          {title ? (
            <h2 className="text-white font-bold uppercase text-xl" style={{ fontFamily: "Barlow Condensed" }}>
              {title}
            </h2>
          ) : <span />}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

/* ---------- Table primitives ---------- */
export function AdminTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="border overflow-hidden" style={{ background: "#161616", borderColor: "#222" }}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function AdminTH({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn("text-left text-[11px] font-semibold uppercase tracking-wider text-[#666] px-4 py-3", className)}
      style={{ background: "#0A0A0A" }}
    >
      {children}
    </th>
  );
}

export function AdminTD({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-[#CCC] border-t", className)} style={{ borderColor: "#1A1A1A" }}>{children}</td>;
}

export function EmptyState({ message }: { message: string }) {
  return <div className="p-12 text-center text-[#666] text-sm">{message}</div>;
}
