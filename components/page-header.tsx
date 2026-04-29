import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-[var(--ink-900)]">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-[15px] text-[var(--ink-600)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
