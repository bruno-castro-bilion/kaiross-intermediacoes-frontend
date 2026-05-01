import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  testId?: string;
}

export function PageHeader({ title, subtitle, actions, testId }: PageHeaderProps) {
  const baseId = testId || "page-header";

  return (
    <div
      data-testid={baseId}
      className="mb-7 flex flex-wrap items-end justify-between gap-6"
    >
      <div data-testid={`${baseId}-text-wrapper`}>
        <h1
          data-testid={`${baseId}-title`}
          className="text-[26px] font-bold tracking-tight text-[var(--ink-900)]"
        >
          {title}
        </h1>
        {subtitle && (
          <p
            data-testid={`${baseId}-subtitle`}
            className="mt-1 text-[15px] text-[var(--ink-600)]"
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div
          data-testid={`${baseId}-actions`}
          className="flex items-center gap-2"
        >
          {actions}
        </div>
      )}
    </div>
  );
}
