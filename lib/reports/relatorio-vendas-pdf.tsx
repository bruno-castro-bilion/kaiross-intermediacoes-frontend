/**
 * Documento PDF do Relatório de Vendas usando @react-pdf/renderer.
 * Charts são desenhados com primitivas SVG (Recharts não roda fora do DOM).
 */

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Svg,
  Rect,
  Path,
  G,
  Line,
} from "@react-pdf/renderer";
import type { PedidoView, RelatorioVendas } from "@/app/api/vendas/types";

/* ─── Paleta ──────────────────────────────────────────────────────────────── */

const C = {
  orange: "#FF6B1A",
  orangeSoft: "#FF8B47",
  orangeBg: "#FFF1E6",
  ink900: "#0F172A",
  ink700: "#334155",
  ink600: "#475569",
  ink500: "#64748B",
  ink400: "#94A3B8",
  ink300: "#CBD5E1",
  ink200: "#E2E8F0",
  ink100: "#F1F5F9",
  ink50: "#F8FAFC",
  ink0: "#FFFFFF",
  success: "#10B981",
  successText: "#047857",
  successBg: "#D1FAE5",
  danger: "#EF4444",
  dangerText: "#B91C1C",
  dangerBg: "#FEE2E2",
  warning: "#F59E0B",
  blue: "#3B82F6",
  purple: "#A78BFA",
  pinkSoft: "#FB7185",
} as const;

const DONUT_COLORS = [
  C.warning,    // Aguardando
  C.purple,     // Em separação
  C.blue,       // Enviado
  C.success,    // Entregue / Pago
  C.pinkSoft,   // Devolvido / Falha
];

/* ─── Estilos ─────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingHorizontal: 40,
    paddingBottom: 50,
    fontFamily: "Helvetica",
    color: C.ink900,
    fontSize: 9.5,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandLogo: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: C.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  brandLogoText: { color: C.ink0, fontSize: 12, fontFamily: "Helvetica-Bold" },
  brandText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  brandDot: {
    color: C.orange,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  periodPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.orangeBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  periodPillLabel: {
    fontSize: 7.5,
    color: C.orange,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
  },
  periodPillValue: {
    fontSize: 8,
    color: C.ink900,
    fontFamily: "Helvetica-Bold",
  },

  /* Section title */
  sectionEyebrow: {
    fontSize: 8,
    color: C.orange,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: C.ink900,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: C.ink500,
    marginBottom: 18,
  },
  divider: {
    height: 1,
    backgroundColor: C.ink200,
    marginBottom: 18,
  },

  /* Meta strip (Empresa / Documento / Período) */
  metaRow: { flexDirection: "row", marginBottom: 16 },
  metaCell: { flex: 1 },
  metaLabel: {
    fontSize: 7.5,
    color: C.ink500,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metaValue: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: C.ink900 },

  /* Grids de cards */
  cardsRow: { flexDirection: "row", gap: 10 },
  cardsRowMb: { flexDirection: "row", gap: 10, marginBottom: 10 },

  /* KPI card */
  kpiCard: {
    flex: 1,
    padding: 12,
    backgroundColor: C.ink0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.ink200,
    minHeight: 86,
  },
  kpiLabel: {
    fontSize: 7.5,
    color: C.ink500,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 18,
    color: C.ink900,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  kpiDelta: { flexDirection: "row", alignItems: "center", gap: 5 },
  kpiDeltaUp: {
    backgroundColor: C.successBg,
    color: C.successText,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kpiDeltaDown: {
    backgroundColor: C.dangerBg,
    color: C.dangerText,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kpiDeltaCaption: { fontSize: 8.5, color: C.ink500 },

  /* Conversão card (com progress bar) */
  convCard: {
    flex: 1,
    padding: 12,
    backgroundColor: C.ink0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.ink200,
    minHeight: 80,
  },
  convLabel: {
    fontSize: 8,
    color: C.ink500,
    marginBottom: 6,
  },
  convValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 17,
    marginBottom: 10,
    letterSpacing: -0.3,
  },

  /* Bar chart card */
  chartCard: {
    padding: 16,
    backgroundColor: C.ink0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.ink200,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  chartTitle: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  legendRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 999 },
  legendLabel: { fontSize: 9, color: C.ink600 },

  /* Tabela */
  tableCard: {
    backgroundColor: C.ink0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.ink200,
    overflow: "hidden",
  },
  tableTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 14,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.ink200,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    color: C.ink500,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.ink100,
    alignItems: "center",
  },
  tableCell: { fontSize: 9.5, color: C.ink900 },

  /* Status pill */
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-start",
  },

  /* Callout (info box) */
  callout: {
    marginTop: 18,
    flexDirection: "row",
    backgroundColor: C.orangeBg,
    borderRadius: 6,
    padding: 12,
  },
  calloutBar: {
    width: 3,
    backgroundColor: C.orange,
    borderRadius: 2,
    marginRight: 10,
  },
  calloutTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: C.orange,
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  calloutBody: { fontSize: 9, color: C.ink700, lineHeight: 1.5 },

  /* Risk page big cards */
  riskCard: {
    flex: 1,
    padding: 16,
    backgroundColor: C.ink0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.ink200,
  },
  riskEyebrow: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.orange,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  riskValue: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: C.ink900,
    marginBottom: 6,
  },
  riskCaption: { fontSize: 9, color: C.ink500, marginBottom: 14 },
  riskMetaRow: { flexDirection: "row", gap: 16 },
  riskMetaLabel: {
    fontSize: 7.5,
    color: C.ink500,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  riskMetaValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.ink900 },

  /* Footer (fixed) */
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: C.ink500,
  },
  footerBrand: { fontFamily: "Helvetica-Bold", color: C.ink900 },

  /* Closing block */
  closing: {
    marginTop: 28,
    alignItems: "center",
  },
  closingEyebrow: {
    fontSize: 8,
    color: C.orange,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  closingName: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  closingSub: { fontSize: 8.5, color: C.ink500, marginTop: 4 },
});

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtBRLShort = (n: number) => {
  if (n >= 1_000_000) return `R$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$${(n / 1_000).toFixed(1)}K`;
  return `R$${n.toFixed(0)}`;
};

function formatPtBR(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
): string {
  const x1 = cx + rOuter * Math.cos(startAngle);
  const y1 = cy + rOuter * Math.sin(startAngle);
  const x2 = cx + rOuter * Math.cos(endAngle);
  const y2 = cy + rOuter * Math.sin(endAngle);
  const x3 = cx + rInner * Math.cos(endAngle);
  const y3 = cy + rInner * Math.sin(endAngle);
  const x4 = cx + rInner * Math.cos(startAngle);
  const y4 = cy + rInner * Math.sin(startAngle);
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

/* ─── Tipo da entrada do documento ────────────────────────────────────────── */

export interface RelatorioVendasKpis {
  receita: number;
  vendas: number;
  ticket: number;
  clientes: number;
}

export interface RelatorioVendasChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface RelatorioVendasProdutoRow {
  prod: string;
  sales: number;
  revenue: number;
  ticket: number;
}

export interface RelatorioVendasReportData {
  periodoLabel: string;
  periodoFrom: Date;
  periodoTo: Date;
  geradoEm: Date;
  pedidos: PedidoView[];
  relatorio?: RelatorioVendas;
  kpis: RelatorioVendasKpis;
  chartData: RelatorioVendasChartPoint[];
  performancePorProduto: RelatorioVendasProdutoRow[];
}

/* ─── Header & Footer ─────────────────────────────────────────────────────── */

function ReportHeader({ from, to }: { from: Date; to: Date }) {
  return (
    <View style={s.header} fixed>
      <View style={s.brand}>
        <View style={s.brandLogo}>
          <Text style={s.brandLogoText}>K</Text>
        </View>
        <Text style={s.brandText}>
          KAIROSS<Text style={s.brandDot}>.</Text>
        </Text>
      </View>
      <View style={s.periodPill}>
        <Text style={s.periodPillLabel}>PERÍODO</Text>
        <Text style={s.periodPillValue}>
          {formatPtBR(from)} – {formatPtBR(to)}
        </Text>
      </View>
    </View>
  );
}

function ReportFooter({ geradoEm }: { geradoEm: Date }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerBrand}>
        Kaiross <Text style={{ color: C.ink400 }}>· Sistema de Vendas</Text>
      </Text>
      <Text>
        Gerado em {formatPtBR(geradoEm)} às {formatTime(geradoEm)}
      </Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          `Página ${pageNumber} de ${totalPages}`
        }
      />
    </View>
  );
}

/* ─── Bar chart (N pontos, 1 série) ───────────────────────────────────────── */

function BarChart({
  data,
  width = 500,
  height = 200,
}: {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
}) {
  const padL = 42;
  const padR = 8;
  const padT = 8;
  const padB = 22;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const max = Math.max(...data.map((d) => d.value), 1);
  const niceMax = (() => {
    const pow = Math.pow(10, Math.floor(Math.log10(max)));
    const norm = max / pow;
    const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
    return niceNorm * pow;
  })();

  const ticks = [0, niceMax * 0.25, niceMax * 0.5, niceMax * 0.75, niceMax];

  const slotW = plotW / Math.max(data.length, 1);
  const barW = Math.min(18, slotW * 0.7);

  // Quando há muitos pontos, mostra rótulos a cada N pra não cruzar.
  const labelStride =
    data.length <= 12 ? 1 : data.length <= 18 ? 2 : Math.ceil(data.length / 8);

  return (
    <Svg width={width} height={height}>
      {ticks.map((t, i) => {
        const y = padT + plotH - (t / niceMax) * plotH;
        return (
          <G key={`tick-${i}`}>
            <Line
              x1={padL}
              y1={y}
              x2={padL + plotW}
              y2={y}
              stroke={C.ink100}
              strokeWidth={1}
            />
            <Text
              x={padL - 6}
              y={y + 3}
              style={{ fontSize: 7.5, fill: C.ink500, textAnchor: "end" }}
            >
              {t >= 1000 ? `R$${(t / 1000).toFixed(0)}K` : `R$${Math.round(t)}`}
            </Text>
          </G>
        );
      })}

      {data.map((d, i) => {
        const cx = padL + i * slotW + slotW / 2;
        const x = cx - barW / 2;
        const h = (d.value / niceMax) * plotH;
        const y = padT + plotH - h;
        const showLabel = i % labelStride === 0;
        return (
          <G key={`${d.label}-${i}`}>
            <Rect x={x} y={y} width={barW} height={h} rx={2} fill={C.orange} />
            {showLabel && (
              <Text
                x={cx}
                y={padT + plotH + 14}
                style={{ fontSize: 7.5, fill: C.ink500, textAnchor: "middle" }}
              >
                {d.label}
              </Text>
            )}
          </G>
        );
      })}
    </Svg>
  );
}

/* ─── Bar chart horizontal (top produtos) ─────────────────────────────────── */

function HorizontalBarChart({
  data,
  width = 500,
  height = 180,
}: {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
}) {
  const padL = 130;
  const padR = 50;
  const padT = 6;
  const padB = 6;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const max = Math.max(...data.map((d) => d.value), 1);

  const rowH = data.length > 0 ? plotH / data.length : 0;
  const barH = Math.min(18, rowH * 0.55);

  return (
    <Svg width={width} height={height}>
      {data.map((d, i) => {
        const cy = padT + i * rowH + rowH / 2;
        const y = cy - barH / 2;
        const w = (d.value / max) * plotW;
        const truncatedLabel =
          d.label.length > 22 ? d.label.slice(0, 21) + "…" : d.label;
        return (
          <G key={`${d.label}-${i}`}>
            <Text
              x={padL - 8}
              y={cy + 3}
              style={{ fontSize: 9, fill: C.ink700, textAnchor: "end" }}
            >
              {truncatedLabel}
            </Text>
            <Rect
              x={padL}
              y={y}
              width={plotW}
              height={barH}
              rx={3}
              fill={C.ink100}
            />
            <Rect x={padL} y={y} width={w} height={barH} rx={3} fill={C.orange} />
            <Text
              x={padL + w + 6}
              y={cy + 3}
              style={{ fontSize: 8.5, fill: C.ink900, textAnchor: "start" }}
            >
              {d.value >= 1000
                ? `R$${(d.value / 1000).toFixed(1)}K`
                : `R$${d.value.toFixed(0)}`}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
}

/* ─── Donut chart ─────────────────────────────────────────────────────────── */

function DonutChart({
  data,
  total,
  size = 140,
}: {
  data: { label: string; value: number }[];
  total: number;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 4;
  const rInner = rOuter - 22;

  let cursor = -Math.PI / 2;
  const safeTotal = total > 0 ? total : 1;

  return (
    <Svg width={size} height={size}>
      {data.map((d, i) => {
        if (d.value <= 0) return null;
        const fraction = d.value / safeTotal;
        // pequeno gap entre fatias (~1.5°) para evitar fundir
        const start = cursor + 0.013;
        const end = cursor + fraction * Math.PI * 2 - 0.013;
        cursor += fraction * Math.PI * 2;
        if (end <= start) return null;
        return (
          <Path
            key={d.label}
            d={arcPath(cx, cy, rOuter, rInner, start, end)}
            fill={DONUT_COLORS[i % DONUT_COLORS.length]}
          />
        );
      })}
      <Text
        x={cx}
        y={cy - 1}
        style={{
          fontSize: 18,
          fontFamily: "Helvetica-Bold",
          fill: C.ink900,
          textAnchor: "middle",
        }}
      >
        {total}
      </Text>
      <Text
        x={cx}
        y={cy + 12}
        style={{
          fontSize: 7,
          fill: C.ink500,
          textAnchor: "middle",
          letterSpacing: 0.6,
        }}
      >
        PEDIDOS
      </Text>
    </Svg>
  );
}

/* ─── Progress bar (para a página 02) ─────────────────────────────────────── */

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <Svg width={180} height={4}>
      <Rect x={0} y={0} width={180} height={4} rx={2} fill={C.ink100} />
      <Rect
        x={0}
        y={0}
        width={(180 * clamped) / 100}
        height={4}
        rx={2}
        fill={color}
      />
    </Svg>
  );
}

/* ─── Cards reutilizáveis ─────────────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  delta,
  deltaPositive,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
}) {
  return (
    <View style={s.kpiCard}>
      <Text style={s.kpiLabel}>{label}</Text>
      <Text style={s.kpiValue}>{value}</Text>
      {delta && (
        <View style={s.kpiDelta}>
          <Text style={deltaPositive ? s.kpiDeltaUp : s.kpiDeltaDown}>
            {deltaPositive ? "▲" : "▼"} {delta}
          </Text>
          <Text style={s.kpiDeltaCaption}>vs. período anterior</Text>
        </View>
      )}
    </View>
  );
}

function ConvCard({
  label,
  value,
  pct,
  bad,
}: {
  label: string;
  value: string;
  pct: number;
  bad?: boolean;
}) {
  return (
    <View style={s.convCard}>
      <Text style={s.convLabel}>{label}</Text>
      <Text style={[s.convValue, { color: bad ? C.danger : C.ink900 }]}>
        {value}
      </Text>
      <ProgressBar pct={pct} color={bad ? C.danger : C.success} />
    </View>
  );
}

/* ─── Cálculos derivados de pedidos ───────────────────────────────────────── */

interface StatusBuckets {
  aguardando: number;
  separacao: number;
  enviado: number;
  entregue: number;
  devolvido: number;
}

function bucketByStatus(pedidos: PedidoView[]): StatusBuckets {
  const b: StatusBuckets = {
    aguardando: 0,
    separacao: 0,
    enviado: 0,
    entregue: 0,
    devolvido: 0,
  };
  pedidos.forEach((p) => {
    switch (p.statusPagamento) {
      case "PENDENTE":
        b.aguardando += 1;
        break;
      case "PAGO":
        if (p.codigoRastreio || p.enviadoEm) b.enviado += 1;
        else b.separacao += 1;
        break;
      case "REEMBOLSADO":
      case "FALHA":
        b.devolvido += 1;
        break;
      // CARRINHO_ABANDONADO não conta na distribuição operacional
    }
  });
  // O backend não tem "ENTREGUE" como status final ainda — fica zerado.
  return b;
}

function ultimasVendas(pedidos: PedidoView[]) {
  return [...pedidos]
    .sort((a, b) => {
      const ta = new Date(a.dataPagamento ?? a.dataCriacao ?? 0).getTime();
      const tb = new Date(b.dataPagamento ?? b.dataCriacao ?? 0).getTime();
      return tb - ta;
    })
    .slice(0, 6);
}

function pedidoStatusPill(p: PedidoView) {
  const status = p.statusPagamento ?? "PENDENTE";
  if (status === "PAGO")
    return { label: "PAGO", bg: C.successBg, color: C.successText };
  if (status === "REEMBOLSADO" || status === "FALHA")
    return { label: status, bg: C.dangerBg, color: C.dangerText };
  return { label: "PENDENTE", bg: "#FEF3C7", color: "#A16207" };
}

/* ─── Página 1 — Resumo Executivo ─────────────────────────────────────────── */

function ResumoExecutivoPage({ data }: { data: RelatorioVendasReportData }) {
  const { kpis, chartData } = data;
  const barData = chartData.map((p) => ({ label: p.date, value: p.revenue }));

  return (
    <Page size="A4" style={s.page}>
      <ReportHeader from={data.periodoFrom} to={data.periodoTo} />

      <Text style={s.sectionEyebrow}>RELATÓRIO DE VENDAS</Text>
      <Text style={s.sectionTitle}>Resumo Executivo</Text>
      <Text style={s.sectionSubtitle}>
        Visão consolidada de performance e fluxo de pedidos no período selecionado.
      </Text>
      <View style={s.divider} />

      <Text style={s.sectionEyebrow}>INDICADORES PRINCIPAIS</Text>

      <View style={s.cardsRowMb}>
        <KpiCard label="RECEITA TOTAL" value={fmtBRLShort(kpis.receita)} />
        <KpiCard label="TOTAL DE VENDAS" value={kpis.vendas.toLocaleString("pt-BR")} />
        <KpiCard label="TICKET MÉDIO" value={kpis.ticket > 0 ? fmtBRL(kpis.ticket) : "—"} />
        <KpiCard label="COMPRADORES ÚNICOS" value={String(kpis.clientes)} />
      </View>

      <View style={[s.chartCard, { marginTop: 18 }]}>
        <View style={s.chartHeader}>
          <Text style={s.chartTitle}>Evolução de receita</Text>
          <View style={s.legendRow}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: C.orange }]} />
              <Text style={s.legendLabel}>Receita ({data.periodoLabel})</Text>
            </View>
          </View>
        </View>
        {barData.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <Text style={{ fontSize: 9.5, color: C.ink500 }}>
              Sem vendas pagas para o período selecionado.
            </Text>
          </View>
        ) : (
          <BarChart data={barData} width={500} height={200} />
        )}
      </View>

      <ReportFooter geradoEm={data.geradoEm} />
    </Page>
  );
}

/* ─── Página 2 — Aprovação & Conversão ────────────────────────────────────── */

function AprovacaoConversaoPage({ data }: { data: RelatorioVendasReportData }) {
  const total = data.pedidos.length;
  const pagos = data.pedidos.filter((p) => p.statusPagamento === "PAGO").length;
  const pendentes = data.pedidos.filter((p) => p.statusPagamento === "PENDENTE").length;
  const falhas = data.pedidos.filter((p) => p.statusPagamento === "FALHA").length;
  const reembolsados = data.pedidos.filter((p) => p.statusPagamento === "REEMBOLSADO").length;
  const abandonados = data.pedidos.filter(
    (p) => p.statusPagamento === "CARRINHO_ABANDONADO",
  ).length;

  const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);

  const aprovacao = pct(pagos, total);
  const reprovacao = pct(falhas, total);
  const taxaPendentes = pct(pendentes, total);
  // Conversão = pagos sobre tudo que chegou ao checkout (excluindo abandonos por cálculo separado)
  const checkouts = pagos + falhas + pendentes;
  const conversao = pct(pagos, checkouts);
  const taxaReembolso = pct(reembolsados, pagos);
  const taxaAbandono = pct(abandonados, abandonados + checkouts);

  return (
    <Page size="A4" style={s.page}>
      <ReportHeader from={data.periodoFrom} to={data.periodoTo} />
      <Text style={s.sectionEyebrow}>02 · MÉTRICAS DE CONVERSÃO</Text>
      <Text style={s.sectionTitle}>Aprovação & Conversão</Text>
      <Text style={s.sectionSubtitle}>
        Como cada etapa do funil performou no período selecionado.
      </Text>

      <View style={s.cardsRowMb}>
        <ConvCard label="Taxa de Aprovação" value={`${aprovacao.toFixed(1)}%`} pct={aprovacao} />
        <ConvCard label="Taxa de Reprovação" value={`${reprovacao.toFixed(1)}%`} pct={reprovacao} bad />
        <ConvCard label="Pedidos Pendentes" value={`${taxaPendentes.toFixed(1)}%`} pct={taxaPendentes} bad={taxaPendentes > 20} />
      </View>
      <View style={s.cardsRowMb}>
        <ConvCard label="Conversão de Checkout" value={`${conversao.toFixed(1)}%`} pct={conversao} />
        <ConvCard label="Taxa de Reembolso" value={`${taxaReembolso.toFixed(1)}%`} pct={taxaReembolso} bad={taxaReembolso > 5} />
        <ConvCard label="Abandono de Carrinho" value={`${taxaAbandono.toFixed(1)}%`} pct={taxaAbandono} bad={taxaAbandono > 30} />
      </View>

      <View style={s.callout}>
        <View style={s.calloutBar} />
        <View style={{ flex: 1 }}>
          <Text style={s.calloutTitle}>COMO LER ESTE BLOCO</Text>
          <Text style={s.calloutBody}>
            Taxas em verde indicam métricas saudáveis (acima do esperado). Taxas em vermelho representam quedas que merecem atenção — geralmente recusas, falhas em meios de pagamento ou abandono de checkout. A barra fina abaixo de cada valor representa a porcentagem em escala de 0 a 100%.
          </Text>
        </View>
      </View>

      <ReportFooter geradoEm={data.geradoEm} />
    </Page>
  );
}

/* ─── Página 3 — Status dos Pedidos ───────────────────────────────────────── */

function StatusPedidosPage({ data }: { data: RelatorioVendasReportData }) {
  const buckets = bucketByStatus(data.pedidos);
  const total =
    buckets.aguardando +
    buckets.separacao +
    buckets.enviado +
    buckets.entregue +
    buckets.devolvido;

  const legenda = [
    { label: "Aguardando", value: buckets.aguardando },
    { label: "Em separação", value: buckets.separacao },
    { label: "Enviado", value: buckets.enviado },
    { label: "Entregue", value: buckets.entregue },
    { label: "Devolvido", value: buckets.devolvido },
  ];

  const ultimas = ultimasVendas(data.pedidos);

  return (
    <Page size="A4" style={s.page}>
      <ReportHeader from={data.periodoFrom} to={data.periodoTo} />
      <Text style={s.sectionEyebrow}>03 · OPERAÇÃO</Text>
      <Text style={s.sectionTitle}>Status dos Pedidos</Text>
      <Text style={s.sectionSubtitle}>
        Distribuição por estágio e amostra das últimas vendas.
      </Text>

      <View style={s.chartCard}>
        <Text style={[s.chartTitle, { marginBottom: 10 }]}>Distribuição por status</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <DonutChart data={legenda} total={total} size={140} />
          <View style={{ flex: 1, gap: 10 }}>
            {legenda.map((row, i) => {
              const pct = total > 0 ? (row.value / total) * 100 : 0;
              return (
                <View
                  key={row.label}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 2,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 999,
                        backgroundColor: DONUT_COLORS[i],
                      }}
                    />
                    <Text style={{ fontSize: 10, color: C.ink900 }}>{row.label}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Text style={{ fontSize: 9.5, color: C.orange, fontFamily: "Helvetica-Bold" }}>
                      {pct.toFixed(1)}%
                    </Text>
                    <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", minWidth: 24, textAlign: "right" }}>
                      {row.value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <Text style={s.tableTitle}>Últimas vendas</Text>
      <View style={s.tableCard}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { flex: 1 }]}>PEDIDO</Text>
          <Text style={[s.tableHeaderCell, { flex: 2 }]}>DATA</Text>
          <Text style={[s.tableHeaderCell, { flex: 1.2 }]}>STATUS</Text>
          <Text style={[s.tableHeaderCell, { flex: 1, textAlign: "right" }]}>VALOR</Text>
        </View>
        {ultimas.length === 0 ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 9.5, color: C.ink500 }}>
              Sem pedidos recentes para exibir.
            </Text>
          </View>
        ) : (
          ultimas.map((p) => {
            const pill = pedidoStatusPill(p);
            const date = new Date(p.dataPagamento ?? p.dataCriacao ?? 0);
            const numero = p.numeroPedido ?? `#${p.id.slice(0, 6)}`;
            return (
              <View key={p.id} style={s.tableRow}>
                <Text style={[s.tableCell, { flex: 1, fontFamily: "Helvetica-Bold" }]}>
                  {numero}
                </Text>
                <Text style={[s.tableCell, { flex: 2, color: C.ink600 }]}>
                  {Number.isNaN(date.getTime())
                    ? "—"
                    : `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}, ${formatTime(date)}`}
                </Text>
                <View style={{ flex: 1.2 }}>
                  <Text style={[s.statusPill, { backgroundColor: pill.bg, color: pill.color }]}>
                    {pill.label}
                  </Text>
                </View>
                <Text
                  style={[
                    s.tableCell,
                    {
                      flex: 1,
                      textAlign: "right",
                      fontFamily: "Helvetica-Bold",
                    },
                  ]}
                >
                  {fmtBRL(p.valorTotal ?? 0)}
                </Text>
              </View>
            );
          })
        )}
      </View>

      <ReportFooter geradoEm={data.geradoEm} />
    </Page>
  );
}

/* ─── Página 4 — Performance por Produto ──────────────────────────────────── */

function PerformanceProdutoPage({ data }: { data: RelatorioVendasReportData }) {
  const top10 = data.performancePorProduto.slice(0, 10);
  const top5 = data.performancePorProduto.slice(0, 5).map((p) => ({
    label: p.prod,
    value: p.revenue,
  }));

  return (
    <Page size="A4" style={s.page}>
      <ReportHeader from={data.periodoFrom} to={data.periodoTo} />
      <Text style={s.sectionEyebrow}>04 · CATÁLOGO</Text>
      <Text style={s.sectionTitle}>Performance por Produto</Text>
      <Text style={s.sectionSubtitle}>
        Quais produtos da sua vitrine geraram mais receita no período.
      </Text>

      <View style={s.chartCard}>
        <View style={s.chartHeader}>
          <Text style={s.chartTitle}>Top 5 produtos por receita</Text>
        </View>
        {top5.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <Text style={{ fontSize: 9.5, color: C.ink500 }}>
              Sem produtos vendidos no período.
            </Text>
          </View>
        ) : (
          <HorizontalBarChart data={top5} width={500} height={Math.max(80, top5.length * 32)} />
        )}
      </View>

      <Text style={s.tableTitle}>Detalhamento (top 10)</Text>
      <View style={s.tableCard}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { flex: 2.5 }]}>PRODUTO</Text>
          <Text style={[s.tableHeaderCell, { flex: 1, textAlign: "right" }]}>UNIDADES</Text>
          <Text style={[s.tableHeaderCell, { flex: 1.2, textAlign: "right" }]}>RECEITA</Text>
          <Text style={[s.tableHeaderCell, { flex: 1.2, textAlign: "right" }]}>PREÇO MÉDIO</Text>
        </View>
        {top10.length === 0 ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 9.5, color: C.ink500 }}>
              Sem dados de produtos vendidos.
            </Text>
          </View>
        ) : (
          top10.map((row) => (
            <View key={row.prod} style={s.tableRow}>
              <Text style={[s.tableCell, { flex: 2.5, fontFamily: "Helvetica-Bold" }]}>
                {row.prod.length > 38 ? row.prod.slice(0, 37) + "…" : row.prod}
              </Text>
              <Text style={[s.tableCell, { flex: 1, textAlign: "right" }]}>
                {row.sales}
              </Text>
              <Text
                style={[
                  s.tableCell,
                  {
                    flex: 1.2,
                    textAlign: "right",
                    color: C.successText,
                    fontFamily: "Helvetica-Bold",
                  },
                ]}
              >
                {fmtBRL(row.revenue)}
              </Text>
              <Text
                style={[
                  s.tableCell,
                  { flex: 1.2, textAlign: "right", fontFamily: "Helvetica-Bold" },
                ]}
              >
                {fmtBRL(row.ticket)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={s.closing}>
        <Text style={s.closingEyebrow}>FIM DO RELATÓRIO</Text>
        <Text style={s.closingSub}>Documento confidencial — uso interno</Text>
      </View>

      <ReportFooter geradoEm={data.geradoEm} />
    </Page>
  );
}

/* ─── Documento principal ─────────────────────────────────────────────────── */

export function RelatorioVendasDocument({ data }: { data: RelatorioVendasReportData }) {
  return (
    <Document
      title={`Kaiross · Relatório de Vendas · ${formatPtBR(data.periodoFrom)} – ${formatPtBR(data.periodoTo)}`}
      author="Kaiross"
    >
      <ResumoExecutivoPage data={data} />
      <AprovacaoConversaoPage data={data} />
      <StatusPedidosPage data={data} />
      <PerformanceProdutoPage data={data} />
    </Document>
  );
}
