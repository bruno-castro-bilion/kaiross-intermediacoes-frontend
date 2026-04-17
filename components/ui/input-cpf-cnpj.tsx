"use client";

import React, { forwardRef, useCallback } from "react";
import { Input } from "./input";

interface InputCpfCnpjProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value?: string;
  onChange?: (value: string) => void;
}

export const InputCpfCnpj = forwardRef<HTMLInputElement, InputCpfCnpjProps>(
  ({ value = "", onChange, ...props }, ref) => {
    const formatCpfMask = (digits: string) => {
      const d = digits.slice(0, 11);
      if (d.length <= 3) return d;
      if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
      if (d.length <= 9)
        return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
      return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
    };

    const formatCnpjMask = (digits: string) => {
      const d = digits.slice(0, 14);
      if (d.length <= 2) return d;
      if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
      if (d.length <= 8)
        return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
      if (d.length <= 12)
        return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
      return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
    };

    const computeDisplay = useCallback((raw: string) => {
      const digits = String(raw || "").replace(/\D/g, "");
      if (digits.length === 0) return "";
      if (digits.length <= 11) return formatCpfMask(digits);
      return formatCnpjMask(digits);
    }, []);

    const [internal, setInternal] = React.useState<string>(() =>
      computeDisplay(value),
    );

    React.useEffect(() => {
      setInternal(computeDisplay(value));
    }, [computeDisplay, value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value.replace(/\D/g, "");

      if (input.length > 14) {
        input = input.slice(0, 14);
      }

      let formatted = "";

      if (input.length === 0) {
        formatted = "";
      } else if (input.length <= 11) {
        formatted = formatCpfMask(input);
      } else {
        formatted = formatCnpjMask(input);
      }

      setInternal(formatted);
      onChange?.(formatted);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={internal}
        onChange={handleChange}
        placeholder="CPF ou CNPJ"
        maxLength={18}
      />
    );
  },
);

InputCpfCnpj.displayName = "InputCpfCnpj";
