import {
  Check,
  AlertCircle,
  Mail,
  Info,
  TriangleAlert,
  User,
  Home,
  Lock,
  UserCheck,
} from "lucide-react";

interface FormHeaderProps {
  type?:
    | "success"
    | "error"
    | "info"
    | "warning"
    | "emailEdit"
    | "userInfoEdit"
    | "userAddressEdit"
    | "passwordEdit"
    | "userCheck";
}

const TYPE_CONFIG = {
  success: {
    color: "rgba(16, 185, 129, 1)",
    colorClass: "text-[#10B981]",
    icon: Check,
    colorBoxShadow:
      "linear-gradient(219.82deg, rgba(3, 31, 27, 0.62) 45.43%, rgba(3, 31, 27, 0.607982) 65.92%, rgba(3, 31, 27, 0) 91.33%)",
  },

  error: {
    color: "rgba(239, 68, 68, 1)",
    colorClass: "text-[#EF4444]",
    icon: AlertCircle,
    colorBoxShadow:
      "linear-gradient(219.82deg, rgba(31, 3, 3, 0.62) 45.43%, rgba(31, 3, 3, 0.607982) 65.92%, rgba(31, 3, 3, 0) 91.33%)",
  },

  warning: {
    color: "rgba(202, 138, 4, 1)",
    colorClass: "text-[#CA8A04]",
    icon: TriangleAlert,
    colorBoxShadow:
      "linear-gradient(219.82deg, #66520062 45.43%, #66520060 65.92%, #66520000 91.33%)",
  },

  info: {
    color: "rgba(59, 130, 246, 1)",
    colorClass: "text-[#3B82F6]",
    icon: Info,
    colorBoxShadow:
      "linear-gradient(219.82deg, #002F66 45.43%, #002F6660 65.92%, #002F6600 91.33%)",
  },
  emailEdit: {
    color: "rgba(202, 138, 4, 1)",
    colorClass: "text-[#CA8A04]",
    icon: Mail,
    colorBoxShadow:
      "linear-gradient(219.82deg, #66520062 45.43%, #66520060 65.92%, #66520000 91.33%)",
  },
  userInfoEdit: {
    color: "rgba(202, 138, 4, 1)",
    colorClass: "text-[#CA8A04]",
    icon: User,
    colorBoxShadow:
      "linear-gradient(219.82deg, #66520062 45.43%, #66520060 65.92%, #66520000 91.33%)",
  },
  userAddressEdit: {
    color: "rgba(202, 138, 4, 1)",
    colorClass: "text-[#CA8A04]",
    icon: Home,
    colorBoxShadow:
      "linear-gradient(219.82deg, #66520062 45.43%, #66520060 65.92%, #66520000 91.33%)",
  },
  passwordEdit: {
    color: "rgba(202, 138, 4, 1)",
    colorClass: "text-[#CA8A04]",
    icon: Lock,
    colorBoxShadow:
      "linear-gradient(219.82deg, #66520062 45.43%, #66520060 65.92%, #66520000 91.33%)",
  },
  userCheck: {
    color: "rgba(16, 185, 129, 1)",
    colorClass: "text-[#10B981]",
    icon: UserCheck,
    colorBoxShadow:
      "linear-gradient(219.82deg, rgba(3, 31, 27, 0.62) 45.43%, rgba(3, 31, 27, 0.607982) 65.92%, rgba(3, 31, 27, 0) 91.33%)",
  },
};

export default function FormHeader({ type }: FormHeaderProps) {
  const currentStatus = type ? TYPE_CONFIG[type] : null;

  const StatusIcon = currentStatus?.icon;
  const isEditVariant =
    type === "emailEdit" ||
    type === "userInfoEdit" ||
    type === "passwordEdit" ||
    type === "userAddressEdit" ||
    type === "userCheck";

  if (!type) {
    return null;
  }

  return (
    <>
      <div
        data-testid="form-header-glow-corner"
        className="pointer-events-none absolute top-0 left-0"
        style={{
          width: "200px",
          height: "150px",
          background:
            "radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 30%, transparent 60%)",
        }}
      />

      <div
        data-testid="form-header"
        data-type={type}
        className="animate-in fade-in relative mb-6 flex items-center justify-center duration-500"
      >
        <div data-testid="form-header-icon-wrapper" className="relative">
          <div
            data-testid="form-header-glow-icon"
            className="pointer-events-none absolute"
            style={{
              width: "150px",
              height: "80px",
              top: "-50px",
              left: "-40px",
              background:
                "radial-gradient(ellipse 65% 70% at 25% 20%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.18) 25%, rgba(255, 255, 255, 0.12) 45%, rgba(255, 255, 255, 0.08) 60%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.02) 85%, transparent 100%)",

              filter: "blur(35px)",
              opacity: 0.9,
            }}
          />

          {StatusIcon && (
            <div
              data-testid="form-header-icon-box"
              data-edit-variant={isEditVariant ? "true" : "false"}
              className={
                "border-border absolute flex items-center justify-center overflow-visible rounded-xl border bg-linear-to-b from-[#f5f5f5] to-[#e8e8e8] shadow-[0_6px_18px_rgba(0,0,0,0.1)] dark:bg-linear-to-b dark:from-[#121214] dark:to-[#0b0b0d] dark:shadow-[0_6px_18px_rgba(2,6,23,0.6)]" +
                (isEditVariant ? " h-16 w-16 p-1.5" : " h-16 w-16")
              }
              style={{
                top: "1px",
                left: "50%",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                boxShadow: `0px 2.33px 3.5px -1.17px #FFFFFF42 inset`,
              }}
            >
              {isEditVariant && (
                <>
                  <div
                    data-testid="form-header-corner-tl"
                    className="absolute top-1.5 left-1.5 h-2 w-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.14),rgba(0,0,0,0.6))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  />
                  <div
                    data-testid="form-header-corner-tr"
                    className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.14),rgba(0,0,0,0.6))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  />
                  <div
                    data-testid="form-header-corner-bl"
                    className="absolute bottom-1.5 left-1.5 h-2 w-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.14),rgba(0,0,0,0.6))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  />
                  <div
                    data-testid="form-header-corner-br"
                    className="absolute right-1.5 bottom-1.5 h-2 w-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.14),rgba(0,0,0,0.6))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  />
                </>
              )}

              <StatusIcon
                data-testid={`form-header-icon-${type}`}
                size={46}
                className={
                  "" +
                  currentStatus.colorClass +
                  (isEditVariant
                    ? " drop-shadow-[0_6px_18px_rgba(202,138,4,0.45)]"
                    : "")
                }
              />
            </div>
          )}

          <div
            data-testid="form-header-spacer"
            style={{ width: "186px", height: "67px" }}
          />
        </div>
      </div>
    </>
  );
}
