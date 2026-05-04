"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  // Bloco de aviso amarelo dentro do diálogo. Útil para efeitos
  // colaterais fora da plataforma (ex.: link público para de funcionar
  // e tráfego pago bate em 404).
  warning?: React.ReactNode;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  warning,
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isLoading && onOpenChange(o)}>
      <DialogContent showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription asChild>
              <div className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </div>
            </DialogDescription>
          )}
        </DialogHeader>

        {warning && (
          <div
            className="flex items-start gap-2.5 rounded-md border p-3 text-[13px] leading-relaxed"
            style={{
              background: "var(--kai-warn-bg, #FFF7E6)",
              borderColor: "var(--kai-warn, #D97706)",
              color: "#7C4A00",
            }}
          >
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            <div>{warning}</div>
          </div>
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: "var(--r-md, 8px)",
              border: "1px solid var(--ink-200)",
              background: "var(--ink-0, #fff)",
              color: "var(--ink-700)",
              fontSize: 13,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: "var(--r-md, 8px)",
              border: 0,
              background: destructive
                ? "var(--kai-danger, #DC2626)"
                : "var(--kai-orange, #EE5A0A)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
