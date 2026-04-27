import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (p: number) => void;
  itemLabel?: string; // ex: "atletas"
};

export function Pagination({ page, perPage, total, onPageChange, itemLabel = "registros" }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * perPage + 1;
  const end = Math.min(total, safePage * perPage);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 text-xs text-[#666666]">
      <div>
        Exibindo <span className="text-[#1A1A1A] font-semibold">{start}-{end}</span> de{" "}
        <span className="text-[#1A1A1A] font-semibold">{total}</span> {itemLabel}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#E5E5E5] rounded text-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F5F5]"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Anterior
        </button>
        <span className="px-3 py-1.5 text-[#1A1A1A]">
          Página {safePage} de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#E5E5E5] rounded text-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F5F5]"
        >
          Próxima <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Hook simples de debounce para campos de busca. */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

import { useEffect, useState } from "react";
