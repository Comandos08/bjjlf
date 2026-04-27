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
    primary: "bg-[#C8211A] text-white hover:bg-[#a01828]",
    danger: "bg-[#C8211A] text-white hover:bg-[#a01828]",
    outline: "bg-transparent text-[#C8211A] border border-[#C8211A] hover:bg-[#FFF0EF]",
    ghost: "bg-transparent text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]",
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
          checked ? "bg-[#3B6D11]" : "bg-[#D1D1D1]",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-[#FFFFFF] transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-[2px]",
          )}
        />
      </button>
      {label && <span className="text-sm text-[#1A1A1A]">{label}</span>}
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
    red: "bg-[#FFF0EF] text-[#C8211A] border-[#F2B7B3]",
    gold: "bg-[#FBF3D9] text-[#8B6F08] border-[#E5D38B]",
    green: "bg-[#EAF3DE] text-[#3B6D11] border-[#B8D89F]",
    blue: "bg-[#E0EDFB] text-[#1E40AF] border-[#A8C9F0]",
    orange: "bg-[#FDEBD7] text-[#9A3412] border-[#F2C99E]",
    purple: "bg-[#F1E2FB] text-[#6B21A8] border-[#D5B4F0]",
    gray: "bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]",
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
        style={{ background: "#FFFFFF", borderColor: "#E5E5E5", maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E5E5E5" }}>
          <h2 className="text-[#1A1A1A] font-bold uppercase text-lg" style={{ fontFamily: "Barlow Condensed" }}>
            {title}
          </h2>
          <button onClick={onClose} className="text-[#666666] hover:text-[#1A1A1A]" aria-label="Fechar">
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
        style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: "#E5E5E5" }}>
          <h2 className="text-[#1A1A1A] font-bold uppercase text-base" style={{ fontFamily: "Barlow Condensed" }}>
            {title}
          </h2>
        </div>
        <div className="p-6">
          <p className="text-[#1A1A1A] text-sm">{message}</p>
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
      <div className="flex border-b mb-3" style={{ borderColor: "#E5E5E5" }}>
        {(["pt", "en"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-px transition-colors",
              tab === t
                ? "text-[#1A1A1A] border-[#C8211A]"
                : "text-[#999999] border-transparent hover:text-[#666666]",
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
            <h2 className="text-[#1A1A1A] font-bold uppercase text-xl" style={{ fontFamily: "Barlow Condensed" }}>
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
    <div className="border overflow-hidden" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function AdminTH({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn("text-left text-[11px] font-semibold uppercase tracking-wider text-[#999999] px-4 py-3", className)}
      style={{ background: "#F8F8F8" }}
    >
      {children}
    </th>
  );
}

export function AdminTD({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-[#1A1A1A] border-t", className)} style={{ borderColor: "#F0F0F0" }}>{children}</td>;
}

export function EmptyState({ message }: { message: string }) {
  return <div className="p-12 text-center text-[#999999] text-sm">{message}</div>;
}
