import * as React from "react";
import { cn } from "@/utils/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-secondary relative w-full overflow-hidden rounded-full",
          className,
        )}
        {...props}
      >
        <div className="h-full w-full bg-transparent" aria-hidden="true">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(value, max)}%`,
              background:
                "linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)",
            }}
          />
        </div>
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
