"use client";

import { Check } from "lucide-react";

interface Step {
  key: string;
  label: string;
}

interface CheckoutStepperProps {
  steps: Step[];
  current: number;
  onJumpTo?: (index: number) => void;
}

const CheckoutStepper = ({ steps, current, onJumpTo }: CheckoutStepperProps) => {
  return (
    <ol
      data-testid="checkout-stepper"
      className="mb-6 flex w-full items-center justify-between gap-2"
    >
      {steps.map((step, index) => {
        const isCompleted = index < current;
        const isActive = index === current;
        const isClickable = isCompleted && typeof onJumpTo === "function";

        return (
          <li
            key={step.key}
            className="flex flex-1 items-center"
            aria-current={isActive ? "step" : undefined}
          >
            <button
              type="button"
              data-testid={`checkout-step-${step.key}`}
              disabled={!isClickable}
              onClick={() => isClickable && onJumpTo!(index)}
              className={`flex flex-col items-center gap-1.5 ${
                isClickable ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                  isCompleted
                    ? "border-green-500 bg-green-500 text-white"
                    : isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`hidden text-xs sm:block ${
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </button>

            {index < steps.length - 1 && (
              <span
                className={`mx-2 h-px flex-1 ${
                  index < current ? "bg-green-500" : "bg-border"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default CheckoutStepper;
