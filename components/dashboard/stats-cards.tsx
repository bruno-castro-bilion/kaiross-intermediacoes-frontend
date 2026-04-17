"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface StatsCard {
  title: string;
  value: string;
  percent: string;
  icon: LucideIcon;
}

interface StatsCardsProps {
  data: StatsCard[];
  loading?: boolean;
  hideBadge?: boolean;
  showBalance?: boolean;
}

export function StatsCards({
  data,
  loading,
  hideBadge = false,
  showBalance = true,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {(loading ? [...Array(4)] : data).map((card, index) => {
        const Icon = loading ? null : card.icon;
        return (
          <motion.div
            key={loading ? index : card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-border/50 bg-card relative overflow-hidden p-4 dark:bg-[radial-gradient(ellipse_at_top_left,rgba(22,22,28,1)_0%,rgba(10,10,15,1)_70%)]">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  {loading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      {card.title}
                    </p>
                  )}
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p
                      className="text-2xl font-bold"
                      style={{
                        filter: !showBalance ? "blur(8px)" : "none",
                        transition: "filter 0.2s ease",
                        userSelect: !showBalance ? "none" : "auto",
                      }}
                    >
                      {card.value}
                    </p>
                  )}
                  {loading ? (
                    <Skeleton className="h-5 w-16" />
                  ) : (
                    !hideBadge && (
                      parseFloat(card.percent) < 0 ? (
                        <Badge className="border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20">
                          <TrendingUp className="mr-1 h-3 w-3 rotate-180" />{card.percent}%
                        </Badge>
                      ) : (
                        <Badge className="border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20">
                          <TrendingUp className="mr-1 h-3 w-3" />+{card.percent}%
                        </Badge>
                      )
                    )
                  )}
                </div>
                <div className="bg-primary/10 rounded-full p-2">
                  {loading ? (
                    <div className="bg-primary/20 h-4 w-4 rounded-full" />
                  ) : (
                    Icon && <Icon className="text-primary h-4 w-4" />
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
