"use client";

import React from "react";

type MenuItemProps = {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  onSelect?: () => void;
  testId?: string;
};

export default function MenuItem({
  label,
  description,
  icon,
  badge,
  selected = false,
  onClick,
  onSelect,
  testId,
}: MenuItemProps) {
  const baseId =
    testId ||
    `menu-item-${label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}`;

  return (
    <button
      data-testid={baseId}
      data-selected={selected ? "true" : "false"}
      type="button"
      onClick={onClick ?? onSelect}
      style={{ cursor: "pointer" }}
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors duration-150 focus:outline-none ${
        selected ? "bg-primary/10" : "hover:bg-neutral-800/40"
      }`}
    >
      {icon && (
        <span
          data-testid={`${baseId}-icon`}
          style={{ cursor: "pointer" }}
          className={`h-4 w-4 shrink-0 ${
            selected ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {icon}
        </span>
      )}

      <div
        data-testid={`${baseId}-content`}
        style={{ cursor: "pointer" }}
        className="min-w-0 flex-1"
      >
        <div
          data-testid={`${baseId}-header`}
          className="flex items-center gap-2"
        >
          <span
            data-testid={`${baseId}-label`}
            style={{ cursor: "pointer" }}
            className={`truncate font-medium ${
              selected ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
          {badge && (
            <span
              data-testid={`${baseId}-badge`}
              style={{ cursor: "pointer" }}
              className={`ml-1 ${selected ? "" : "text-muted-foreground"}`}
            >
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p
            data-testid={`${baseId}-description`}
            style={{ cursor: "pointer" }}
            className={`truncate text-sm ${
              selected ? "text-muted-foreground" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </button>
  );
}
