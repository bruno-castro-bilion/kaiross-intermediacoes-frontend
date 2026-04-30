"use client";

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: boolean;
}

export function StatCard({ icon: Icon, label, value, highlight }: StatCardProps) {
  return (
    <div
      className="flex items-center gap-3.5 rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-4 transition-all hover:shadow-[var(--sh-md)] hover:-translate-y-px"
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: highlight ? "var(--kai-orange)" : "var(--kai-orange-50)",
          color: highlight ? "white" : "var(--kai-orange-600)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-[var(--ink-600)]">{label}</span>
        <span className="text-[22px] font-bold leading-none tracking-tight text-[var(--ink-900)]">
          {value}
        </span>
      </div>
    </div>
  );
}
