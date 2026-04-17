"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  Star,
  SlidersHorizontal,
  Store,
  DollarSign,
  Layers,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  secao: "mais-vendidos" | "virais" | "diversos";
}

const produtos: Produto[] = [
  { id: 1, nome: "Fone Bluetooth Premium", categoria: "Eletrônicos", precoVenda: 189.9, custo: 89.0, estoque: 1240, estoqueMax: 2000, imagem: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format", secao: "mais-vendidos" },
  { id: 2, nome: "Mochila Executiva Slim", categoria: "Moda", precoVenda: 159.9, custo: 72.0, estoque: 543, estoqueMax: 800, badge: "Hot", imagem: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&auto=format", secao: "virais" },
  { id: 3, nome: "Panela Antiaderente 28cm", categoria: "Casa", precoVenda: 129.9, custo: 58.0, estoque: 892, estoqueMax: 1200, imagem: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&auto=format", secao: "mais-vendidos" },
  { id: 4, nome: "Kit Skincare Hidratante", categoria: "Beleza", precoVenda: 249.9, custo: 98.0, estoque: 321, estoqueMax: 600, badge: "Novo", imagem: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&auto=format", secao: "virais" },
  { id: 5, nome: "Tênis Running Pro", categoria: "Esportes", precoVenda: 299.9, custo: 134.0, estoque: 178, estoqueMax: 500, imagem: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format", secao: "diversos" },
  { id: 6, nome: "Controle de Video Game", categoria: "Eletrônicos", precoVenda: 199.9, custo: 87.0, estoque: 456, estoqueMax: 700, badge: "Hot", imagem: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop&auto=format", secao: "virais" },
  { id: 7, nome: "Jaqueta Corta-vento", categoria: "Moda", precoVenda: 219.9, custo: 96.0, estoque: 267, estoqueMax: 400, imagem: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop&auto=format", secao: "diversos" },
  { id: 8, nome: "Luminária LED Mesa", categoria: "Casa", precoVenda: 89.9, custo: 38.0, estoque: 1103, estoqueMax: 1500, badge: "Novo", imagem: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop&auto=format", secao: "mais-vendidos" },
];

const categorias = ["Todas", "Eletrônicos", "Moda", "Casa", "Beleza", "Esportes", "Brinquedos"];

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function VitrineDeProtudos() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [ordenacao, setOrdenacao] = useState("mais-vendidos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const produtosFiltrados = useMemo(() => {
    let lista = produtos.filter((p) => {
      const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
      const matchCategoria = categoria === "Todas" || p.categoria === categoria;
      return matchBusca && matchCategoria;
    });

    switch (ordenacao) {
      case "menor-preco": lista = [...lista].sort((a, b) => a.precoVenda - b.precoVenda); break;
      case "maior-preco": lista = [...lista].sort((a, b) => b.precoVenda - a.precoVenda); break;
      case "novidades":   lista = [...lista].sort((a, b) => (b.badge === "Novo" ? 1 : 0) - (a.badge === "Novo" ? 1 : 0)); break;
      default:            lista = [...lista].sort((a, b) => b.estoque - a.estoque); break;
    }
    return lista;
  }, [busca, categoria, ordenacao]);

  const totalProdutos = produtos.length;
  const maiorMargem = Math.max(...produtos.map((p) => ((p.precoVenda - p.custo) / p.precoVenda) * 100));
  const mediaPreco = produtos.reduce((acc, p) => acc + p.precoVenda, 0) / produtos.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6 p-6"
    >
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Vitrine de Produtos</h1>
        <p className="text-muted-foreground text-sm">
          Explore o catálogo e escolha o produto para vender.
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="py-4 gap-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
              <Layers className="text-primary size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total de produtos</p>
              <p className="text-xl font-bold">{totalProdutos}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 gap-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
              <TrendingUp className="text-primary size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Maior margem</p>
              <p className="text-xl font-bold">{maiorMargem.toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 gap-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
              <DollarSign className="text-primary size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Preço médio</p>
              <p className="text-xl font-bold">{fmt(mediaPreco)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar produtos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-muted-foreground size-4 shrink-0" />
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={ordenacao} onValueChange={setOrdenacao}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mais-vendidos">Mais vendidos</SelectItem>
            <SelectItem value="menor-preco">Menor preço</SelectItem>
            <SelectItem value="maior-preco">Maior preço</SelectItem>
            <SelectItem value="novidades">Novidades</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="secondary" className="h-9 shrink-0 px-3 text-sm font-medium">
          {produtosFiltrados.length} {produtosFiltrados.length === 1 ? "produto" : "produtos"}
        </Badge>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="gap-0 overflow-hidden py-0">
              <Skeleton className="aspect-square w-full rounded-none" />
              <CardContent className="flex flex-col gap-2 px-3 py-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 py-20 text-center"
        >
          <div className="bg-muted flex size-16 items-center justify-center rounded-full">
            <Package className="text-muted-foreground size-8" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Nenhum produto encontrado</p>
            <p className="text-muted-foreground text-sm">Tente ajustar os filtros ou a busca.</p>
          </div>
          <Button variant="outline" onClick={() => { setBusca(""); setCategoria("Todas"); }}>
            Limpar filtros
          </Button>
        </motion.div>
      ) : (() => {
        const secoes = [
          { key: "mais-vendidos" as const, label: "🔥 Mais vendidos" },
          { key: "virais" as const, label: "📈 Virais" },
          { key: "diversos" as const, label: "🛍️ Diversos" },
        ];

        const renderCard = (produto: Produto, index: number) => (
          <motion.div
            key={produto.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
          >
            <Card className="gap-0 overflow-hidden py-0 h-full flex flex-col">
              <div className="bg-muted relative aspect-[4/3] overflow-hidden">
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                {produto.badge && (
                  <div className="absolute right-2 top-2">
                    {produto.badge === "Hot" ? (
                      <Badge className="gap-1 border-transparent bg-orange-500 text-xs text-white hover:bg-orange-500">
                        <Star className="size-3 fill-white" /> Hot
                      </Badge>
                    ) : (
                      <Badge className="border-transparent bg-emerald-500 text-xs text-white hover:bg-emerald-500">
                        Novo
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <CardContent className="flex flex-1 flex-col gap-2 px-3 py-3">
                <p className="line-clamp-2 text-sm font-bold leading-snug uppercase">{produto.nome}</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
                    Custo por unidade
                  </span>
                  <span className="text-primary text-base font-bold">{fmt(produto.custo)}</span>
                </div>
              </CardContent>

              <CardFooter className="px-3 pb-3 pt-0">
                <Link href={`/vitrine-de-produtos/${produto.id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Mais Detalhes
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        );

        return (
          <div className="flex flex-col gap-8">
            {secoes.map(({ key, label }) => {
              const lista = produtosFiltrados.filter((p) => p.secao === key);
              if (lista.length === 0) return null;
              return (
                <div key={key} className="flex flex-col gap-4">
                  <h2 className="text-base font-bold">{label}</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {lista.map((produto, index) => renderCard(produto, index))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Rodapé */}
      {!loading && produtosFiltrados.length > 0 && (
        <div className="flex flex-col items-center gap-2 pb-4 pt-2">
          <p className="text-muted-foreground text-xs">
            Exibindo {produtosFiltrados.length} de {produtos.length} produtos do catálogo
          </p>
          <Button variant="outline" size="sm" className="gap-2">
            <Package className="size-4" />
            Carregar mais produtos
          </Button>
        </div>
      )}
    </motion.div>
  );
}
