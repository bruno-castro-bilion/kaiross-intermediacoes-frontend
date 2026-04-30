"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPage: (p: number) => void;
  onPerPage?: (n: number) => void;
  label?: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  perPage,
  onPage,
  onPerPage,
  label = "itens",
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const range: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) range.push(i);
  } else {
    range.push(1);
    if (page > 3) range.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) range.push(i);
    if (page < totalPages - 2) range.push("...");
    range.push(totalPages);
  }

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ink-200)] px-5 py-3.5"
    >
      <div className="flex items-center gap-3 text-[13px] text-[var(--ink-600)]">
        <span>
          Exibindo{" "}
          <strong style={{ color: "var(--ink-900)", fontFamily: "var(--font-mono)" }}>
            {start}–{end}
          </strong>{" "}
          de{" "}
          <strong style={{ color: "var(--ink-900)", fontFamily: "var(--font-mono)" }}>
            {total}
          </strong>{" "}
          {label}
        </span>
        {onPerPage && (
          <>
            <span className="text-[var(--ink-300)]">·</span>
            <label className="flex cursor-pointer items-center gap-2">
              <span>Por página</span>
              <select
                value={perPage}
                onChange={(e) => onPerPage(Number(e.target.value))}
                style={{
                  height: 28,
                  border: "1px solid var(--ink-200)",
                  borderRadius: 6,
                  padding: "0 8px",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "var(--ink-0)",
                  color: "var(--ink-900)",
                  cursor: "pointer",
                }}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="flex h-8 items-center gap-1 rounded-lg border border-[var(--ink-200)] bg-[var(--ink-0)] px-3 text-[13px] font-semibold text-[var(--ink-700)] transition-all hover:border-[var(--ink-300)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} /> Anterior
        </button>

        <div className="flex items-center gap-1">
          {range.map((n, i) =>
            n === "..." ? (
              <span key={"e" + i} className="px-1.5 text-[var(--ink-400)]">…</span>
            ) : (
              <button
                key={n}
                onClick={() => onPage(n as number)}
                style={{
                  minWidth: 32,
                  height: 32,
                  padding: "0 10px",
                  border: `1px solid ${n === page ? "var(--kai-orange)" : "var(--ink-200)"}`,
                  background: n === page ? "var(--kai-orange)" : "var(--ink-0)",
                  color: n === page ? "white" : "var(--ink-700)",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {n}
              </button>
            )
          )}
        </div>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPage(page + 1)}
          className="flex h-8 items-center gap-1 rounded-lg border border-[var(--ink-200)] bg-[var(--ink-0)] px-3 text-[13px] font-semibold text-[var(--ink-700)] transition-all hover:border-[var(--ink-300)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Próxima <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
