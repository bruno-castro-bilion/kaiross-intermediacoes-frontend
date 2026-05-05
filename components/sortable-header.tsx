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
        gap: 4,
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
      <Icon size={12} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.55 }} />
    </button>
  );
}
