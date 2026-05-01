"use client";

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: boolean;
  testId?: string;
}

export function StatCard({ icon: Icon, label, value, highlight, testId }: StatCardProps) {
  const baseId =
    testId ||
    `stat-card-${label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}`;

  return (
    <div
      data-testid={baseId}
      data-highlight={highlight ? "true" : "false"}
      className="flex items-center gap-3.5 rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-4 transition-all hover:shadow-[var(--sh-md)] hover:-translate-y-px"
    >
      <div
        data-testid={`${baseId}-icon-wrapper`}
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
        <Icon data-testid={`${baseId}-icon`} size={20} />
      </div>
      <div data-testid={`${baseId}-content`} className="flex flex-col gap-0.5">
        <span
          data-testid={`${baseId}-label`}
          className="text-xs text-[var(--ink-600)]"
        >
          {label}
        </span>
        <span
          data-testid={`${baseId}-value`}
          className="text-[22px] font-bold leading-none tracking-tight text-[var(--ink-900)]"
        >
          {value}
        </span>
      </div>
    </div>
  );
}
