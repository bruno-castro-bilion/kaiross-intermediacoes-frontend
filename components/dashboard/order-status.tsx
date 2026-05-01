"use client";

interface OrderStatusData {
  label: string;
  value: number;
  color: string;
}

interface OrderStatusProps {
  data: OrderStatusData[];
  total: number;
}

export function OrderStatus({ data, total }: OrderStatusProps) {
  const size = 180;
  const r = size / 2 - 14;
  const c = size / 2;
  const stroke = 14;
  const circumference = 2 * Math.PI * r * 0.75; // arco de 270°
  const totalVal = data.reduce((s, x) => s + x.value, 0);

  // Pré-calcula offset acumulado para cada segmento
  const segmentsWithOffset = data.reduce<
    Array<OrderStatusData & { offset: number; len: number }>
  >((acc, seg) => {
    const prevOffset =
      acc.length > 0
        ? acc[acc.length - 1].offset + acc[acc.length - 1].len
        : 0;
    const len = (seg.value / totalVal) * circumference;
    return [...acc, { ...seg, offset: prevOffset, len }];
  }, []);

  return (
    <div
      data-testid="order-status"
      className="flex h-full flex-col rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-6 shadow-[var(--sh-xs)]"
    >
      {/* Título */}
      <div
        data-testid="order-status-header"
        className="mb-4 flex items-center justify-between"
      >
        <h3
          data-testid="order-status-title"
          className="text-[17px] font-bold tracking-[-0.01em] text-[var(--ink-900)]"
        >
          Status dos pedidos
        </h3>
        <a
          data-testid="order-status-link-view-all"
          className="cursor-pointer text-[13px] font-semibold text-[var(--kai-orange-600)] hover:underline"
        >
          Ver todos →
        </a>
      </div>

      {/* Gauge 270° + legenda lado a lado */}
      <div
        data-testid="order-status-body"
        className="flex flex-1 items-center gap-6"
      >
        {/* Gauge SVG */}
        <div
          data-testid="order-status-gauge-wrapper"
          className="relative shrink-0"
          style={{ width: size, height: Math.round(size * 0.78) }}
        >
          <svg
            data-testid="order-status-gauge-svg"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ transform: "rotate(135deg)" }}
          >
            {/* Trilha de fundo */}
            <circle
              data-testid="order-status-gauge-track"
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke="var(--ink-200)"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${2 * Math.PI * r}`}
              strokeLinecap="round"
            />
            {/* Segmentos coloridos */}
            {segmentsWithOffset.map((seg, i) => (
              <circle
                key={i}
                data-testid={`order-status-gauge-segment-${seg.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "")}`}
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${seg.len} ${2 * Math.PI * r}`}
                strokeDashoffset={-seg.offset}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Valor central */}
          <div
            data-testid="order-status-gauge-center"
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ paddingTop: 14 }}
          >
            <span
              data-testid="order-status-gauge-total"
              className="mono-num text-[36px] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink-900)]"
            >
              {total.toLocaleString("pt-BR")}
            </span>
            <span
              data-testid="order-status-gauge-caption"
              className="mt-1 text-[12px] text-[var(--ink-600)]"
            >
              pedidos hoje
            </span>
          </div>
        </div>

        {/* Legenda */}
        <div
          data-testid="order-status-legend"
          className="flex flex-1 flex-col gap-2"
        >
          {data.map((item, index) => {
            const slug = item.label
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
            return (
              <div
                key={index}
                data-testid={`order-status-legend-item-${slug}`}
                className="flex items-center justify-between text-[13px]"
              >
                <div
                  data-testid={`order-status-legend-item-${slug}-label-wrapper`}
                  className="flex items-center gap-2"
                >
                  <span
                    data-testid={`order-status-legend-item-${slug}-dot`}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: item.color,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    data-testid={`order-status-legend-item-${slug}-label`}
                    className="text-[var(--ink-700)]"
                  >
                    {item.label}
                  </span>
                </div>
                <span
                  data-testid={`order-status-legend-item-${slug}-value`}
                  className="mono-num font-semibold text-[var(--ink-900)]"
                >
                  {item.value.toLocaleString("pt-BR")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
