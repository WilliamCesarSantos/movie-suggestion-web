type PaginationProps = {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onChange: (page: number) => void;
};

const btn =
  "rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500";

export function Pagination({ page, totalPages, disabled = false, onChange }: PaginationProps) {
  return (
    <nav aria-label="Paginação de usuários" className="flex items-center gap-3">
      <button type="button" className={btn} disabled={disabled || page <= 1} onClick={() => onChange(page - 1)}>
        &lt; Anterior
      </button>
      <span aria-current="page" className="text-sm text-neutral-300">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className={btn}
        disabled={disabled || page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Próxima &gt;
      </button>
    </nav>
  );
}
