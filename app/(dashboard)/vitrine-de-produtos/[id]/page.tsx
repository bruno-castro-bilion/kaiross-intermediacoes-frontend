"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  TrendingUp,
  Package,
  ShoppingCart,
  Store,
  ClipboardList,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface Produto {
  id: number;
  nome: string;
  categoria: string;
  precoVenda: number;
  custo: number;
  estoque: number;
  estoqueMax: number;
  imagem: string;
  badge?: "Novo" | "Hot";
}

const produtos: Produto[] = [
  { id: 1, nome: "Fone Bluetooth Premium", categoria: "Eletrônicos", precoVenda: 189.9, custo: 89.0, estoque: 1240, estoqueMax: 2000, imagem: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format" },
  { id: 2, nome: "Mochila Executiva Slim", categoria: "Moda", precoVenda: 159.9, custo: 72.0, estoque: 543, estoqueMax: 800, badge: "Hot", imagem: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&auto=format" },
  { id: 3, nome: "Panela Antiaderente 28cm", categoria: "Casa", precoVenda: 129.9, custo: 58.0, estoque: 892, estoqueMax: 1200, imagem: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop&auto=format" },
  { id: 4, nome: "Kit Skincare Hidratante", categoria: "Beleza", precoVenda: 249.9, custo: 98.0, estoque: 321, estoqueMax: 600, badge: "Novo", imagem: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop&auto=format" },
  { id: 5, nome: "Tênis Running Pro", categoria: "Esportes", precoVenda: 299.9, custo: 134.0, estoque: 178, estoqueMax: 500, imagem: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&auto=format" },
  { id: 6, nome: "Controle de Video Game", categoria: "Eletrônicos", precoVenda: 199.9, custo: 87.0, estoque: 456, estoqueMax: 700, badge: "Hot", imagem: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=800&fit=crop&auto=format" },
  { id: 7, nome: "Jaqueta Corta-vento", categoria: "Moda", precoVenda: 219.9, custo: 96.0, estoque: 267, estoqueMax: 400, imagem: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop&auto=format" },
  { id: 8, nome: "Luminária LED Mesa", categoria: "Casa", precoVenda: 89.9, custo: 38.0, estoque: 1103, estoqueMax: 1500, badge: "Novo", imagem: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop&auto=format" },
];

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const especificacoesPorProduto: Record<number, Record<string, string>> = {
  1: { Categoria: "Eletrônicos", Peso: "250g", Dimensões: "18 × 17 × 8 cm", Garantia: "12 meses", SKU: "ELE-001-BT" },
  2: { Categoria: "Moda", Peso: "700g", Dimensões: "45 × 32 × 15 cm", Garantia: "6 meses", SKU: "MOD-002-MO" },
  3: { Categoria: "Casa", Peso: "1.2kg", Dimensões: "Ø 28 × 6 cm", Garantia: "24 meses", SKU: "CAS-003-PA" },
  4: { Categoria: "Beleza", Peso: "350g", Dimensões: "20 × 15 × 8 cm", Garantia: "18 meses", SKU: "BEL-004-SK" },
  5: { Categoria: "Esportes", Peso: "620g", Dimensões: "32 × 22 × 12 cm", Garantia: "12 meses", SKU: "ESP-005-TE" },
  6: { Categoria: "Eletrônicos", Peso: "215g", Dimensões: "15 × 10 × 4 cm", Garantia: "12 meses", SKU: "ELE-006-CT" },
  7: { Categoria: "Moda", Peso: "480g", Dimensões: "65 × 55 × 2 cm", Garantia: "6 meses", SKU: "MOD-007-JA" },
  8: { Categoria: "Casa", Peso: "550g", Dimensões: "40 × 12 × 12 cm", Garantia: "12 meses", SKU: "CAS-008-LU" },
};

const descricoesPorProduto: Record<number, string[]> = {
  1: ["O Fone Bluetooth Premium foi desenvolvido para quem exige qualidade de som e conforto prolongado. Com drivers de 40mm e cancelamento de ruído passivo, oferece uma experiência sonora imersiva tanto para música quanto para chamadas.", "Sua bateria de longa duração garante até 30 horas de reprodução contínua, e o design dobrável facilita o transporte no dia a dia. Compatível com todos os dispositivos Bluetooth 5.0.", "Ideal para o mercado de eletrônicos de consumo, este produto apresenta alta demanda e excelente avaliação entre os compradores, tornando-se uma das melhores opções para revendedores."],
  2: ["A Mochila Executiva Slim combina estética moderna com funcionalidade para o profissional contemporâneo. Compartimentos organizados, material resistente à água e alças ergonômicas tornam cada deslocamento mais prático.", "O design slim comporta notebooks de até 15,6 polegadas sem perder a elegância. O interior acolchoado protege seus equipamentos enquanto o exterior transmite sofisticação.", "Com grande apelo no segmento de moda corporativa, esta mochila apresenta alto giro e ótimo ticket médio."],
  3: ["A Panela Antiaderente 28cm é revestida com camada antiaderente de alta performance, livre de PFOA, garantindo segurança alimentar e facilidade no preparo e na limpeza dos alimentos.", "Seu cabo ergonômico com revestimento termoprotetor e a compatibilidade com todos os tipos de fogão — incluindo indução — fazem desta panela uma escolha versátil.", "Um clássico entre os produtos de casa, a panela antiaderente tem demanda constante durante todo o ano."],
  4: ["O Kit Skincare Hidratante reúne os produtos essenciais para uma rotina de cuidados com a pele: sérum hidratante, creme noturno e loção corporal, todos formulados com ingredientes de origem natural.", "Os produtos são dermatologicamente testados, adequados para peles sensíveis e livres de parabenos. A embalagem premium valoriza o produto e agrega percepção de valor.", "O segmento de beleza e skincare vive um momento de expansão no Brasil, tornando este kit uma aposta estratégica."],
  5: ["O Tênis Running Pro foi projetado para atletas e praticantes de corrida que buscam desempenho e amortecimento. A sola de borracha com padrão de tração multidirecional proporciona estabilidade.", "O cabedal em mesh respirável mantém os pés frescos durante o exercício, enquanto o sistema de amortecimento EVA reduz o impacto em cada passada.", "Esportes e vida ativa são tendência crescente no Brasil. Este tênis atende tanto ao corredor iniciante quanto ao intermediário."],
  6: ["O Controle de Video Game é compatível com os principais consoles e PC, oferecendo conectividade sem fio via Bluetooth e com fio via USB-C. Gatilhos analógicos e vibração dupla garantem imersão total.", "A bateria recarregável oferece até 20 horas de jogo contínuo. O design ergonômico foi desenvolvido para reduzir a fadiga nas mãos mesmo em sessões longas.", "O mercado gamer no Brasil está entre os que mais crescem no mundo. Este controle tem alta demanda entre jovens de 15 a 35 anos."],
  7: ["A Jaqueta Corta-vento é fabricada em nylon ripstop de alta resistência com revestimento impermeável DWR, ideal para atividades ao ar livre e para o uso urbano em dias de chuva leve.", "Leve e compactável, pode ser dobrada em seu próprio bolso. Os bolsos com zíper e o capuz ajustável completam a funcionalidade desta peça versátil.", "Moda outdoor e athleisure seguem em alta no segmento de vestuário, atraindo tanto o público esportivo quanto o consumidor de moda casual."],
  8: ["A Luminária LED Mesa oferece iluminação de qualidade com temperatura de cor ajustável entre 3000K e 6500K, adaptando-se a diferentes ambientes e momentos do dia.", "O braço articulável permite direcionar a luz com precisão, enquanto o dimmer touch possibilita ajuste gradual da intensidade. A porta USB lateral permite carregar dispositivos.", "Iluminação de qualidade é cada vez mais valorizada em home office e ambientes residenciais. Este produto tem apelo amplo e especialmente procurado em épocas de volta às aulas."],
};

type TabKey = "descricao" | "especificacoes" | "como-vender";

export default function DetalhesProduto() {
  const params = useParams();
  const id = Number(params.id);
  const produto = produtos.find((p) => p.id === id);
  const [tab, setTab] = useState<TabKey>("descricao");

  if (!produto) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
        <div className="bg-muted flex size-16 items-center justify-center rounded-full">
          <Package className="text-muted-foreground size-8" />
        </div>
        <p className="text-lg font-semibold">Produto não encontrado</p>
        <Link href="/vitrine-de-produtos">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" /> Voltar para a vitrine
          </Button>
        </Link>
      </div>
    );
  }

  const margem = produto.precoVenda - produto.custo;
  const margemPct = ((margem / produto.precoVenda) * 100).toFixed(0);
  const estoquePercent = Math.round((produto.estoque / produto.estoqueMax) * 100);
  const especificacoes = especificacoesPorProduto[produto.id] ?? {};
  const descricoes = descricoesPorProduto[produto.id] ?? [];

  const tabs: { key: TabKey; label: string }[] = [
    { key: "descricao", label: "Descrição" },
    { key: "especificacoes", label: "Especificações" },
    { key: "como-vender", label: "Como vender" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex max-w-6xl flex-col gap-8 p-6 pb-12"
    >
      {/* Voltar */}
      <Link href="/vitrine-de-produtos">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2 gap-2">
          <ArrowLeft className="size-4" />
          Voltar para a vitrine
        </Button>
      </Link>

      {/* Seção principal */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

        {/* Imagem */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-border shadow-md"
        >
          {produto.badge && (
            <div className="absolute left-3 top-3 z-10">
              {produto.badge === "Hot" ? (
                <Badge className="gap-1 border-transparent bg-orange-500 text-white shadow hover:bg-orange-500">
                  <Star className="size-3 fill-white" /> Hot
                </Badge>
              ) : (
                <Badge className="border-transparent bg-emerald-500 text-white shadow hover:bg-emerald-500">
                  Novo
                </Badge>
              )}
            </div>
          )}
          <img
            src={produto.imagem}
            alt={produto.nome}
            className="aspect-square h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex flex-col gap-6"
        >
          {/* Categoria + Nome */}
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit text-xs">
              {produto.categoria}
            </Badge>
            <h1 className="text-3xl font-bold leading-tight tracking-tight">
              {produto.nome}
            </h1>
            {/* Avaliações */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-semibold">4.8</span>
              <span className="text-muted-foreground text-sm">· 127 avaliações</span>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Preços */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Preços
            </p>
            <div className="grid grid-cols-3 gap-3">
              {/* Custo */}
              <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-foreground p-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 text-white/60">
                  🏷️ Seu custo
                </span>
                <span className="text-lg font-bold text-white">{fmt(produto.custo)}</span>
                <span className="text-xs font-semibold text-white/70 leading-snug">
                  Preço fixo por unidade. Sem surpresas.
                </span>
              </div>
              {/* Você define o preço */}
              <div className="flex flex-col gap-1.5 rounded-xl border border-primary bg-primary p-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                  🚀 Seu preço
                </span>
                <span className="text-lg font-bold text-white">Você decide</span>
                <span className="text-xs font-semibold text-white/80 leading-snug">
                  Venda pelo preço que quiser e maximize seu lucro.
                </span>
              </div>
              {/* Pagamento automático */}
              <div className="relative flex flex-col gap-1.5 rounded-xl border border-emerald-300 bg-emerald-500 p-3 overflow-hidden dark:border-emerald-700 dark:bg-emerald-600">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">
                  💸 Zero risco
                </span>
                <span className="text-white text-sm font-bold leading-snug">
                  Vendeu? O fornecedor recebe na hora, cuida de toda a entrega pro cliente, e você fica com todo o lucro.
                </span>
              </div>
            </div>
          </div>

          {/* Estoque */}
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Estoque disponível
              </span>
              <span className="text-sm font-bold">
                {produto.estoque.toLocaleString("pt-BR")}{" "}
                <span className="text-muted-foreground font-normal text-xs">un.</span>
              </span>
            </div>
            <Progress value={estoquePercent} className="h-2.5" />
            <p className="text-muted-foreground text-xs">
              {estoquePercent}% do máximo · {produto.estoqueMax.toLocaleString("pt-BR")} unidades totais
            </p>
          </div>

          {/* CTA */}
          <Button size="lg" className="gap-2 rounded-xl py-6 text-base font-semibold shadow-md shadow-primary/20">
            <ShoppingCart className="size-5" />
            Vender este produto
          </Button>
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex flex-col gap-0 rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
      >
        {/* Tab bar */}
        <div className="flex border-b border-border bg-muted/30">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-4 text-sm font-semibold transition-all ${
                tab === t.key
                  ? "border-b-2 border-primary text-primary bg-card"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Descrição */}
          {tab === "descricao" && (
            <motion.div key="descricao" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 max-w-3xl"
            >
              {descricoes.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </motion.div>
          )}

          {/* Especificações */}
          {tab === "especificacoes" && (
            <motion.div key="especificacoes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
              className="max-w-xl overflow-hidden rounded-xl border border-border"
            >
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(especificacoes).map(([chave, valor], i) => (
                    <tr key={chave} className={i % 2 === 0 ? "bg-muted/40" : "bg-card"}>
                      <td className="w-1/3 px-4 py-3 font-medium text-muted-foreground">{chave}</td>
                      <td className="px-4 py-3 font-semibold">{valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* Como vender */}
          {tab === "como-vender" && (
            <motion.div key="como-vender" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {[
                {
                  num: "01",
                  icon: TrendingUp,
                  title: "Defina seu preço",
                  desc: "Use o custo por unidade como base e defina sua margem de lucro. Considere frete e embalagem para chegar ao preço ideal de venda.",
                },
                {
                  num: "02",
                  icon: Store,
                  title: "Crie sua página ou loja",
                  desc: "Monte sua loja virtual ou página de vendas com o produto. Capriche nas fotos, descrição e gatilhos que geram confiança no comprador.",
                },
                {
                  num: "03",
                  icon: ClipboardList,
                  title: "Venda e acompanhe seus pedidos",
                  desc: "Divulgue, receba pedidos e acompanhe tudo pelo painel Kaiross em tempo real. Mantenha seu cliente informado e garanta uma ótima experiência.",
                },
              ].map((card) => (
                <div key={card.num} className="relative flex flex-col gap-4 rounded-xl border border-border bg-muted/20 p-5 overflow-hidden">
                  <span className="absolute right-4 top-3 text-5xl font-black text-muted/40 select-none leading-none">
                    {card.num}
                  </span>
                  <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                    <card.icon className="text-primary size-5" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-semibold">{card.title}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
