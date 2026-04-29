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
    <div className="flex h-full flex-col rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-6 shadow-[var(--sh-xs)]">
      {/* Título */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[17px] font-bold tracking-[-0.01em] text-[var(--ink-900)]">
          Status dos pedidos
        </h3>
        <a className="cursor-pointer text-[13px] font-semibold text-[var(--kai-orange-600)] hover:underline">
          Ver todos →
        </a>
      </div>

      {/* Gauge 270° + legenda lado a lado */}
      <div className="flex flex-1 items-center gap-6">
        {/* Gauge SVG */}
        <div
          className="relative shrink-0"
          style={{ width: size, height: Math.round(size * 0.78) }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ transform: "rotate(135deg)" }}
          >
            {/* Trilha de fundo */}
            <circle
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
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ paddingTop: 14 }}
          >
            <span className="mono-num text-[36px] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink-900)]">
              {total.toLocaleString("pt-BR")}
            </span>
            <span className="mt-1 text-[12px] text-[var(--ink-600)]">
              pedidos hoje
            </span>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex flex-1 flex-col gap-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-[13px]"
            >
              <div className="flex items-center gap-2">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: item.color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span className="text-[var(--ink-700)]">{item.label}</span>
              </div>
              <span className="mono-num font-semibold text-[var(--ink-900)]">
                {item.value.toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
