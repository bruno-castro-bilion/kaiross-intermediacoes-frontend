type StatusType = "ativo" | "pausado" | "enviado" | "entregue" | "aguardando" | "separacao" | "devolvido";

const STATUS_MAP: Record<
  StatusType,
  { label: string; bg: string; fg: string; dot: string }
> = {
  ativo:      { label: "Ativo",         bg: "var(--kai-success-bg)", fg: "var(--kai-success)",  dot: "var(--kai-success)" },
  pausado:    { label: "Pausado",       bg: "var(--kai-warn-bg)",    fg: "var(--kai-warn)",     dot: "var(--kai-warn)" },
  enviado:    { label: "Enviado",       bg: "var(--kai-orange-50)",  fg: "var(--kai-orange-600)", dot: "var(--kai-orange)" },
  entregue:   { label: "Entregue",     bg: "var(--kai-success-bg)", fg: "var(--kai-success)",  dot: "var(--kai-success)" },
  aguardando: { label: "Aguardando",   bg: "var(--kai-warn-bg)",    fg: "var(--kai-warn)",     dot: "var(--kai-warn)" },
  separacao:  { label: "Em separação", bg: "var(--kai-orange-50)",  fg: "var(--kai-orange-600)", dot: "var(--kai-orange)" },
  devolvido:  { label: "Devolvido",    bg: "var(--kai-danger-bg)",  fg: "var(--kai-danger)",   dot: "var(--kai-danger)" },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pausado;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 22,
        padding: "0 8px",
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }}
      />
      {s.label}
    </span>
  );
}
