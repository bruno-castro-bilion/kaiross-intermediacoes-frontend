import { toast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  CircleX,
} from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface CustomToastOptions {
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-green-500",
    borderColor: "border-green-500",
    borderHex: "#16a34a",
    label: "Sucesso",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-red-500",
    borderColor: "border-red-500",
    borderHex: "#ef4444",
    label: "Erro",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
    borderColor: "border-yellow-500",
    borderHex: "#f59e0b",
    label: "Aviso",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    borderColor: "border-blue-500",
    borderHex: "#3b82f6",
    label: "Info",
  },
};

export function showToast({
  title,
  description,
  type,
  duration = 3000,
}: CustomToastOptions) {
  const config = toastConfig[type];
  const Icon = config.icon;
  const borderHex = config.borderHex ?? "transparent";

  const sanitizedDescription =
    typeof description === "string" && /internal server/i.test(description)
      ? "Sistema temporariamente indisponível. Tente novamente mais tarde."
      : description;

  toast(null, {
    icon: null,
    className: `relative h-[90px] w-[90vw] max-w-[500px] overflow-hidden flex items-center mx-auto pl-8 pr-7 py-4 bg-notification`,
    style: { border: "none" },
    unstyled: false,
    description: (
      <div className="flex h-full w-full flex-col">
        <div className="absolute top-3 right-3 z-60">
          <button
            aria-label="Fechar"
            onClick={() => toast.dismiss()}
            className="text-muted-foreground hover:bg-muted/30 cursor-pointer rounded-md p-1 transition-colors"
          >
            <CircleX className="h-4 w-4 cursor-pointer" />
          </button>
        </div>

        <div className="flex flex-1 items-center gap-4 pr-8">
          <div className="relative ml-4 flex shrink-0 items-center justify-center">
            <div
              className="absolute rounded-full"
              style={{
                backgroundColor: borderHex,
                opacity: 0.15,
                width: "40px",
                height: "40px",
              }}
            />
            <Icon
              className={`h-6 w-6 shrink-0 ${config.iconColor} relative z-10`}
              style={{
                animation: "iconPop 0.3s ease-out",
              }}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="text-foreground text-[15px] leading-tight font-semibold wrap-break-word">
              {title}
            </div>
            {description && (
              <div className="text-muted-foreground mt-1.5 text-[13px] leading-snug wrap-break-word">
                {sanitizedDescription}
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted/20 absolute right-0 bottom-0 left-0 h-1 overflow-hidden rounded-b-lg">
          <div
            className="h-full transition-all ease-linear"
            style={{
              backgroundColor: borderHex,
              opacity: 0.7,
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>

        <style jsx>{`
          @keyframes shrink {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
          @keyframes iconPop {
            0% {
              transform: scale(0.5);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    ),
    duration,
  });
}
