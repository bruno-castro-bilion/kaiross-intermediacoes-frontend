"use client";

import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

export type SortDirection = "asc" | "desc" | null;

export interface SortState<K extends string = string> {
  key: K | null;
  dir: SortDirection;
}

interface SortableHeaderProps<K extends string> {
  label: string;
  sortKey: K;
  current: SortState<K>;
  onChange: (next: SortState<K>) => void;
  align?: "left" | "right" | "center";
}

// Header de coluna ordenável. Clique alterna asc → desc → nenhum.
// Renderiza só o label + ícone das setas; estilos de tamanho/cor seguem
// as regras herdadas do container do header (intencional, pra encaixar
// em todos os layouts existentes sem disputa de CSS).
export function SortableHeader<K extends string>({
  label,
  sortKey,
  current,
  onChange,
  align = "left",
}: SortableHeaderProps<K>) {
  const isActive = current.key === sortKey && current.dir !== null;

  const handleClick = () => {
    if (current.key !== sortKey) {
      onChange({ key: sortKey, dir: "asc" });
      return;
    }
    if (current.dir === "asc") {
      onChange({ key: sortKey, dir: "desc" });
      return;
    }
    onChange({ key: null, dir: null });
  };

  const Icon = !isActive
    ? ChevronsUpDown
    : current.dir === "asc"
      ? ChevronUp
      : ChevronDown;

  const justify =
    align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start";

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: justify,
        gap: 6,
        background: "transparent",
        border: 0,
        padding: 0,
        margin: 0,
        font: "inherit",
        color: isActive ? "var(--kai-orange)" : "inherit",
        cursor: "pointer",
        userSelect: "none",
        textTransform: "inherit",
        letterSpacing: "inherit",
        fontWeight: "inherit",
        width: "100%",
        textAlign: align,
      }}
      aria-sort={
        !isActive ? "none" : current.dir === "asc" ? "ascending" : "descending"
      }
    >
      <span>{label}</span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 18,
          height: 18,
          borderRadius: 4,
          background: isActive ? "var(--kai-orange-50, #FFF1E6)" : "var(--ink-100, #F1EEE9)",
          color: isActive ? "var(--kai-orange)" : "var(--ink-600, #5C5650)",
          flexShrink: 0,
          transition: "background .12s, color .12s",
        }}
      >
        <Icon size={14} strokeWidth={2.4} />
      </span>
    </button>
  );
}
