"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, RefreshCw } from "lucide-react";

interface TokenExpirationDialogProps {
  open: boolean;
  timeRemaining: number;
  isRefreshing: boolean;
  onContinue: () => void;
  onLogout: () => void;
}

export function TokenExpirationDialog({
  open,
  timeRemaining,
  isRefreshing,
  onContinue,
  onLogout,
}: TokenExpirationDialogProps) {
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Ei! Só um aviso rápido 👋
          </DialogTitle>
          <DialogDescription>
            Por motivos de segurança, sua sessão na Kaiross expira em 10
            minutos. Renove agora e continue de onde parou, sem perder nada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="bg-muted rounded-lg px-6 py-4 text-center">
              <div className="text-3xl font-bold tabular-nums">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </div>
              <div className="text-muted-foreground mt-1 text-sm">
                {minutes === 0 && seconds <= 60 ? "segundos" : "minutos"}{" "}
                restantes
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-center text-sm">
            Deseja continuar conectado ou fazer logout agora?
          </p>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onLogout}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair agora
          </Button>
          <Button
            onClick={onContinue}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Renovando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Continuar conectado
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
