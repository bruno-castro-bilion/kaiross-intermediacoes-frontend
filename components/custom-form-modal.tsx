"use client";
"use no memo";
import { useAuthStore } from "@/lib/store/auth-store";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  Resolver,
  useForm,
  type FieldValues,
  type FieldErrors,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import FormHeader from "./form-header";
import { Input } from "./ui/input";
import { InputCpfCnpj } from "./ui/input-cpf-cnpj";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  PercentIcon,
  DollarSignIcon,
  TriangleAlert,
} from "lucide-react";
import PasswordStrength from "@/components/password-strength";
import dynamic from "next/dynamic";
import type React from "react";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";

const InputPhone = dynamic(
  () => import("./ui/input-phone").then((mod) => mod.PhoneInput),
  { ssr: false },
);

import { countries, type PhoneInputValue } from "@/lib/countries";

import { cn } from "@/utils/utils";
import { showToast } from "./custom-toast";
import { AxiosError } from "axios";
import { useTheme } from "next-themes";

type InputDef = {
  name: string;
  label: string;
  inputType?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "textarea"
    | "phone"
    | "cpf"
    | "cpf-cnpj"
    | "select"
    | "date"
    | "columns";
  placeholder?: string;
  defaultValue?: unknown;
  options?: { value: string; label: string; valorOferta?: number }[];
  required?: boolean;
  columns?: InputDef[];
  classNameInput?: string;
  ativo?: boolean;
  iconInput?: string;
};

type InputRow = InputDef | InputDef[];

type ModalButton = {
  buttonType: "submit" | "cancel";
  label: string;
  variant?: "default" | "outline" | "link" | "secondary" | "destructive";
  loadingLabel?: string;
};

interface ModalProps {
  title?: string;
  description?: string;
  schema?: unknown;
  inputs?: InputRow[];
  iconType?:
    | "success"
    | "error"
    | "info"
    | "warning"
    | "emailEdit"
    | "userInfoEdit"
    | "userAddressEdit"
    | "passwordEdit";
  selectOptions?: {
    name: string;
    options: { value: string; label: string; valorOferta?: number }[];
  }[];
  trigger?: React.ReactNode;
  triggerLabel?: string;
  triggerClassName?: string;
  testId?: string;
  submitButton?: ModalButton;
  cancelButton?: ModalButton;
  defaultValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  passwordStrength?: boolean;
  isAccountRemove?: boolean;
  horizontalHeader?: boolean;
  destructiveSubmit?: boolean;
  forceConfirm?: boolean;
  isPending?: boolean;
  isOpen?: boolean;
  buttonSucessTitle?: string;
  successToastTitle?: string;
  successToastDescription?: string;
  onOpenChange?: (open: boolean) => void;
  variant?: "default" | "clean";
  orderBump?: boolean;
  onSelectChange?: (value: { value: string; label: string }) => void;
}

export function CustomModalForm({
  title,
  description,
  schema,
  inputs,
  trigger,
  iconType,
  triggerLabel = "Open",
  triggerClassName,
  testId,
  submitButton = { buttonType: "submit", label: "Enviar", variant: "default" },
  cancelButton = { buttonType: "cancel", label: "Cancelar", variant: "link" },
  defaultValues,
  onSubmit,
  passwordStrength = false,
  isAccountRemove = false,
  horizontalHeader = false,
  destructiveSubmit = false,
  forceConfirm = false,
  isPending = false,
  isOpen: isOpenProp,
  buttonSucessTitle = "Ok",
  successToastTitle = "Sucesso",
  successToastDescription = "Operação concluída",
  onOpenChange,
  variant = "default",
  selectOptions = [],
  orderBump = false,
  onSelectChange,
}: ModalProps): React.JSX.Element {
  type FormValues = Record<string, unknown> & FieldValues;

  const baseId = testId || "custom-modal-form";

  const resolver: Resolver<FormValues> | undefined = schema
    ? (zodResolver as unknown as (s: unknown) => Resolver<FormValues>)(
        schema as unknown,
      )
    : undefined;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
    reset,
    trigger: formTrigger,
    setValue,
    control,
  } = useForm<FormValues>({
    resolver: resolver as unknown as Resolver<FormValues> | undefined,
    defaultValues: defaultValues as unknown as FormValues,

    mode: "onTouched",
  });

  const [open, setOpen] = useState(false);
  const isControlled = typeof isOpenProp === "boolean";

  const innerScrollRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { theme } = useTheme();
  const isLightTheme = theme === "light";
  // const [needsScroll, setNeedsScroll] = useState<boolean>(false);

  // useLayoutEffect(() => {
  //   const el = innerScrollRef.current;
  //   if (!el) return;
  //   const check = () => {
  //     setNeedsScroll(el.scrollHeight > el.clientHeight + 1);
  //   };
  //   check();
  //   window.addEventListener("resize", check);
  //   return () => window.removeEventListener("resize", check);
  // }, [open, inputs, defaultValues]);

  useEffect(() => {
    if (isControlled) {
      setOpen(Boolean(isOpenProp));
    }
  }, [isOpenProp, isControlled]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [suppressFormOnClose, setSuppressFormOnClose] = useState(false);

  useEffect(() => {
    if (!open) {
      reset(defaultValues as unknown as FormValues);
    }
  }, [open, defaultValues, reset]);

  useEffect(() => {
    if (open) {
      reset(defaultValues as unknown as FormValues);
    }
  }, [open, reset, formTrigger, defaultValues]);

  const password = watch
    ? // eslint-disable-next-line react-hooks/incompatible-library
      (watch("password") as string | undefined)
    : undefined;

  const codigoPaisForm = watch("codigoPais") as string | undefined;
  const dddForm = watch("ddd") as string | undefined;

  const handleClose = () => {
    reset(defaultValues as unknown as FormValues);
  };

  const internalSubmit = async (data: FormValues) => {
    try {
      await onSubmit(data);
      if (
        iconType === "passwordEdit" ||
        iconType === "emailEdit" ||
        isAccountRemove
      ) {
        setShowSuccessScreen(true);

        handleClose();
      } else {
        showToast({
          type: "success",
          title: successToastTitle,
          description: successToastDescription,
        });
        handleClose();
        if (!isControlled) setOpen(false);
        onOpenChange?.(false);
      }
    } catch (e: unknown) {
      let message = "Erro";
      if (e instanceof AxiosError) {
        message =
          e.response?.data?.error || e.response?.data?.message || e.message;
      } else if (typeof e === "object" && e && "message" in e) {
        const maybeMessage = (e as { message?: unknown }).message;
        if (typeof maybeMessage === "string") {
          message = maybeMessage;
        } else {
          message = String(maybeMessage ?? "Erro");
        }
      } else {
        message = String(e ?? "Erro");
      }

      showToast({
        type: "error",
        title: "Erro",
        description: message,
      });
    }
  };

  useEffect(() => {
    if (!open && !suppressFormOnClose) {
      setShowSuccessScreen(false);
    }
  }, [open, suppressFormOnClose]);

  const IconInput = (icon: string) => {
    switch (icon) {
      case "percent":
        return <PercentIcon className="h-4 w-4" />;
      case "real":
        return <DollarSignIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const successTitle = isAccountRemove
    ? "Conta encerrada"
    : iconType === "passwordEdit"
      ? "Senha alterada"
      : iconType === "emailEdit"
        ? "E-mail alterado"
        : "Sucesso";

  const getLoadingLabel = () => {
    if (isAccountRemove) return "Encerrando conta";
    if (iconType === "emailEdit") return "Alterando e-mail";
    if (iconType === "passwordEdit") return "Alterando senha";
    return String(
      submitButton?.loadingLabel ?? submitButton?.label ?? "Carregando...",
    );
  };

  const successDescription = isAccountRemove
    ? "Sua conta foi encerrada com sucesso."
    : iconType === "passwordEdit"
      ? "Sua senha foi alterada com sucesso."
      : iconType === "emailEdit"
        ? "Seu e-mail foi alterado com sucesso."
        : "Operação concluída com sucesso.";

  const [ativoValidade, setAtivoValidade] = useState(true);
  const [nameOffer, setNameOffer] = useState("");
  const [valorOferta, setValorOferta] = useState(0);

  useEffect(() => {
    if (open && defaultValues?.ofertaLabel) {
      setNameOffer(defaultValues.ofertaLabel as string);
      setValorOferta(defaultValues.ofertaValor as number);
    }
  }, [open, defaultValues]);
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (forceConfirm) {
            if (v) {
              if (!isControlled) setOpen(true);
              else onOpenChange?.(true);
            }

            return;
          }

          if (!isControlled) {
            setOpen(v);
          }
          onOpenChange?.(v);
        }}
      >
        {trigger !== undefined ? (
          <DialogTrigger asChild data-testid={`${baseId}-trigger`}>
            {(trigger as React.ReactNode) || <></>}
          </DialogTrigger>
        ) : (
          <DialogTrigger asChild data-testid={`${baseId}-trigger`}>
            <Button
              className={cn("", triggerClassName)}
              data-testid={`${baseId}-trigger-button`}
            >
              {triggerLabel}
            </Button>
          </DialogTrigger>
        )}

        <DialogContent
          className={cn(
            "flex max-h-[95vh] flex-col p-6",
            variant === "clean" && "sm:w-128.75!",
            orderBump && "bg-card",
          )}
          style={{ width: 410, maxWidth: "95vw" }}
          showCloseButton={!forceConfirm}
          data-testid={`${baseId}-dialog`}
        >
          {showSuccessScreen ? (
            <>
              <DialogHeader
                className="items-center"
                data-testid={`${baseId}-success`}
              >
                {variant === "default" && <FormHeader type="success" />}
                <DialogTitle
                  className="text-foreground text-center text-lg"
                  data-testid={`${baseId}-success-title`}
                >
                  {successTitle}
                </DialogTitle>
                <p
                  className="text-muted-foreground text-center text-sm"
                  data-testid={`${baseId}-success-description`}
                >
                  {successDescription}
                </p>
              </DialogHeader>

              <DialogFooter
                className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:space-x-4"
                data-testid={`${baseId}-success-footer`}
              >
                <DialogClose asChild>
                  <Button
                    variant="default"
                    className="w-full rounded-lg py-3 sm:flex-1"
                    data-testid={`${baseId}-success-button-ok`}
                    onClick={() => {
                      setSuppressFormOnClose(true);

                      if (!isControlled) setOpen(false);
                      onOpenChange?.(false);

                      setTimeout(() => {
                        setShowSuccessScreen(false);
                        setSuppressFormOnClose(false);
                      }, 300);

                      if (isAccountRemove) {
                        logout();
                        if (typeof window !== "undefined") {
                          router.push("/login");
                        }
                      }
                    }}
                  >
                    {buttonSucessTitle}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader
                className={cn(
                  "items-center",
                  variant === "clean" ? "items-start" : "",
                )}
                data-testid={`${baseId}-header`}
              >
                {isAccountRemove || horizontalHeader ? (
                  <div
                    className="w-full"
                    data-testid={`${baseId}-header-horizontal`}
                  >
                    <div className="flex items-start gap-4">
                      {iconType === "warning" && (
                        <div
                          className="bg-primary/40 flex h-12 w-12 items-center justify-center rounded-xl"
                          data-testid={`${baseId}-header-icon-warning`}
                        >
                          <TriangleAlert className="text-primary" />
                        </div>
                      )}

                      {iconType === "error" && (
                        <div
                          className="bg-error/40 flex h-12 w-12 items-center justify-center rounded-xl"
                          data-testid={`${baseId}-header-icon-error`}
                        >
                          <AlertCircle className="text-error" />
                        </div>
                      )}

                      {!iconType && (
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3a2326]"
                          data-testid={`${baseId}-header-icon-default`}
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EF4444]">
                            <AlertCircle className="text-foreground h-4 w-4" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        {title && (
                          <DialogTitle
                            className="text-foreground text-left text-lg"
                            data-testid={`${baseId}-title`}
                          >
                            {title}
                          </DialogTitle>
                        )}
                        {description && (
                          <p
                            className="text-muted-foreground mt-2 text-sm whitespace-pre-line"
                            data-testid={`${baseId}-description`}
                          >
                            {description
                              .split(/(\*\*[^*]+\*\*)/g)
                              .map((part, i) => {
                                const match = part.match(/^\*\*([^*]+)\*\*$/);
                                if (match)
                                  return (
                                    <span
                                      key={i}
                                      className="text-muted-foreground mt-1 block text-base font-semibold"
                                      data-testid={`${baseId}-description-bold-${i}`}
                                    >
                                      {match[1]}
                                    </span>
                                  );
                                return (
                                  <span
                                    key={i}
                                    data-testid={`${baseId}-description-text-${i}`}
                                  >
                                    {part}
                                  </span>
                                );
                              })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {variant === "default" && <FormHeader type={iconType} />}
                    {title && (
                      <DialogTitle
                        className={cn(
                          "text-foreground text-center text-lg",
                          variant === "clean" ? "text-start! font-medium" : "",
                        )}
                        data-testid={`${baseId}-title`}
                      >
                        {title}
                      </DialogTitle>
                    )}
                    {variant === "clean" && (
                      <hr
                        className="mt-3 mb-3 w-full"
                        data-testid={`${baseId}-header-divider`}
                      />
                    )}
                    {description && (
                      <p
                        className="text-muted-foreground text-center text-sm"
                        data-testid={`${baseId}-description`}
                      >
                        {description}
                      </p>
                    )}
                  </>
                )}
              </DialogHeader>

              <form
                id="modal-form"
                onSubmit={handleSubmit(internalSubmit)}
                className="flex min-h-0 flex-1 flex-col px-0"
                data-testid={`${baseId}-form`}
              >
                <div
                  ref={innerScrollRef}
                  className={cn("min-h-0 flex-1 overflow-y-auto pr-1")}
                  data-testid={`${baseId}-scroll`}
                >
                  {isAccountRemove ? (
                    <div
                      className="mt-4 space-y-4"
                      data-testid={`${baseId}-confirm-text-wrapper`}
                    >
                      <label
                        className="text-muted-foreground mb-2 text-sm"
                        data-testid={`${baseId}-confirm-text-label`}
                      >
                        Para confirma disse &quot;Encerrar conta&quot;
                      </label>
                      <Input
                        {...register("confirmText")}
                        placeholder="Encerrar conta"
                        className={cn(
                          "mt-2 text-sm",
                          (errors as FieldErrors<FormValues>).confirmText
                            ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                            : "border-border focus-visible:ring-ring focus-visible:ring-1",
                        )}
                        aria-invalid={
                          !!(errors as FieldErrors<FormValues>).confirmText
                        }
                        data-testid={`${baseId}-input-confirm-text`}
                      />
                      {(errors as FieldErrors<FormValues>).confirmText && (
                        <p
                          className="text-xs text-red-500"
                          data-testid={`${baseId}-error-confirm-text`}
                        >
                          {
                            (
                              (errors as FieldErrors<FormValues>)
                                .confirmText as {
                                message?: string;
                              }
                            )?.message
                          }
                        </p>
                      )}
                    </div>
                  ) : (
                    inputs?.map((inputRow, rowIndex) => {
                      const inputsArray = Array.isArray(inputRow)
                        ? inputRow
                        : [inputRow];
                      const isMultiColumn = inputsArray.length > 1;

                      return (
                        <div
                          key={rowIndex}
                          className={cn(
                            "mb-5",
                            isMultiColumn && "grid grid-cols-2 gap-4",
                          )}
                          data-testid={`${baseId}-row-${rowIndex}`}
                        >
                          {inputsArray.map((inp) => {
                            const nameKey = inp.name as keyof FormValues &
                              string;
                            const fieldError = (
                              errors as FieldErrors<FormValues>
                            )[nameKey] as unknown as
                              | { message?: string }
                              | undefined;

                            return (
                              <div
                                key={inp.name}
                                className={cn(
                                  "flex flex-col gap-1.5",
                                  inp.classNameInput,
                                  inp.name === "validade" &&
                                    !ativoValidade &&
                                    "gap-0",
                                )}
                                data-testid={`${baseId}-field-${inp.name}`}
                              >
                                {inp.ativo ? (
                                  <Controller
                                    control={control}
                                    name={nameKey}
                                    render={({
                                      field: { value = true, onChange },
                                    }) => (
                                      <div
                                        className="flex items-center justify-between py-2"
                                        data-testid={`${baseId}-field-${inp.name}-switch-row`}
                                      >
                                        <label
                                          className="text-foreground text-sm font-medium"
                                          data-testid={`${baseId}-field-${inp.name}-label`}
                                        >
                                          {inp.label}
                                          {inp.required && (
                                            <span className="text-primary ml-1">
                                              *
                                            </span>
                                          )}
                                        </label>
                                        <Switch
                                          checked={value}
                                          onCheckedChange={(checked) => {
                                            onChange(checked);
                                            setAtivoValidade(checked);
                                          }}
                                          data-testid={`${baseId}-switch-${inp.name}`}
                                        />
                                      </div>
                                    )}
                                  />
                                ) : (
                                  <label
                                    className="text-foreground text-sm"
                                    data-testid={`${baseId}-field-${inp.name}-label`}
                                  >
                                    {inp.label}
                                    {inp.required && (
                                      <span className="text-primary ml-1">
                                        *
                                      </span>
                                    )}
                                  </label>
                                )}
                                {String(inp.inputType) === "textarea" ? (
                                  <textarea
                                    {...register(nameKey)}
                                    placeholder={inp.placeholder}
                                    aria-invalid={!!fieldError}
                                    className={cn(
                                      "w-full rounded-md bg-transparent px-4 py-3 text-sm",
                                      fieldError
                                        ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                                        : "border-input border",
                                    )}
                                    data-testid={`${baseId}-textarea-${inp.name}`}
                                  />
                                ) : String(inp.inputType) === "phone" ? (
                                  (() => {
                                    return (
                                      <Controller
                                        control={control}
                                        name={nameKey}
                                        render={({ field }) => {
                                          let phoneInputValue:
                                            | PhoneInputValue
                                            | undefined = undefined;

                                          if (
                                            codigoPaisForm ||
                                            dddForm ||
                                            field.value
                                          ) {
                                            const dialCode =
                                              codigoPaisForm?.startsWith("+")
                                                ? codigoPaisForm
                                                : `+${codigoPaisForm || "55"}`;
                                            const country =
                                              countries.find(
                                                (c) => c.dialCode === dialCode,
                                              ) ||
                                              countries.find(
                                                (c) => c.code === "BR",
                                              );

                                            if (country) {
                                              const phoneNumber =
                                                (dddForm || "") +
                                                (field.value || "");

                                              phoneInputValue = {
                                                country,
                                                phoneNumber: phoneNumber,
                                                fullNumber: `${country.dialCode}${phoneNumber}`,
                                                isValid: true,
                                              };
                                            }
                                          }

                                          return (
                                            <InputPhone
                                              value={phoneInputValue}
                                              onChange={(value) => {
                                                const dialCode =
                                                  value.country.dialCode.replace(
                                                    "+",
                                                    "",
                                                  );
                                                const digitsOnly =
                                                  value.phoneNumber.replace(
                                                    /\D/g,
                                                    "",
                                                  );

                                                setValue(
                                                  "codigoPais",
                                                  dialCode,
                                                );

                                                if (
                                                  value.country.code === "BR" &&
                                                  digitsOnly.length > 2
                                                ) {
                                                  setValue(
                                                    "ddd",
                                                    digitsOnly.slice(0, 2),
                                                  );
                                                  setValue(
                                                    nameKey,
                                                    digitsOnly.slice(2),
                                                  );
                                                  field.onChange(
                                                    digitsOnly.slice(2),
                                                  );
                                                } else {
                                                  setValue(nameKey, digitsOnly);
                                                  field.onChange(digitsOnly);
                                                }
                                              }}
                                              data-testid={`${baseId}-phone-${inp.name}`}
                                            />
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : String(inp.inputType) === "cpf" ||
                                  nameKey === "cpf" ? (
                                  <Controller
                                    control={control}
                                    name={nameKey}
                                    render={({ field }) => {
                                      const commonClass = cn(
                                        "mt-4 text-sm",
                                        fieldError
                                          ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                                          : "border-border focus-visible:ring-ring focus-visible:ring-1",
                                      );

                                      return (
                                        <InputCpfCnpj
                                          value={String(field.value ?? "")}
                                          onChange={(val: string) =>
                                            field.onChange(val)
                                          }
                                          placeholder={
                                            inp.placeholder || "CPF ou CNPJ"
                                          }
                                          className={commonClass}
                                          maxLength={18}
                                          data-testid={`${baseId}-input-${inp.name}`}
                                        />
                                      );
                                    }}
                                  />
                                ) : String(inp.inputType) === "select" ? (
                                  <Controller
                                    control={control}
                                    name={nameKey}
                                    render={({ field }) => {
                                      const options =
                                        inp.options ||
                                        selectOptions.find(
                                          (s) => s.name === inp.name,
                                        )?.options ||
                                        [];

                                      return (
                                        <Select
                                          onValueChange={(val) => {
                                            field.onChange(val);

                                            const selectedOption = options.find(
                                              (opt) => opt.value === val,
                                            );

                                            const selectedLabel = selectedOption
                                              ? selectedOption.label
                                              : val;

                                            if (inp.name === "oferta") {
                                              setNameOffer(selectedLabel);

                                              if (selectedOption?.valorOferta) {
                                                setValorOferta(
                                                  selectedOption.valorOferta,
                                                );
                                              }
                                            }

                                            if (inp.name === "produto") {
                                              setValorOferta(9700);
                                              setNameOffer(
                                                "DE R$197,00 POR APENAS R$97,00",
                                              );

                                              setValue("oferta", "");
                                            }

                                            onSelectChange?.({
                                              value: val,
                                              label: inp.label,
                                            });
                                          }}
                                          value={String(field.value ?? "")}
                                        >
                                          <SelectTrigger
                                            className={cn(
                                              "mt-2 w-full text-sm",
                                              fieldError
                                                ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                                                : "border-border focus-visible:ring-ring focus-visible:ring-1",
                                            )}
                                            data-testid={`${baseId}-select-${inp.name}`}
                                          >
                                            <SelectValue
                                              placeholder={
                                                inp.placeholder ||
                                                "Selecione..."
                                              }
                                            />
                                          </SelectTrigger>
                                          <SelectContent
                                            data-testid={`${baseId}-select-${inp.name}-content`}
                                          >
                                            {options.map((opt) => (
                                              <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                                data-testid={`${baseId}-select-${inp.name}-option-${opt.value}`}
                                              >
                                                {opt.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      );
                                    }}
                                  />
                                ) : String(inp.inputType) === "columns" ? (
                                  <div
                                    className="flex w-full flex-wrap gap-2"
                                    data-testid={`${baseId}-columns-${inp.name}`}
                                  >
                                    {inp.columns?.map((col) => {
                                      const reg = register(col.name);
                                      return (
                                        <div
                                          key={col.name}
                                          className={cn(
                                            "flex w-full flex-col sm:w-auto",
                                            (col.name === "dataEnd" ||
                                              col.name === "dataStart") &&
                                              !ativoValidade &&
                                              "hidden",
                                          )}
                                          data-testid={`${baseId}-field-${col.name}`}
                                        >
                                          <label
                                            className="text-foreground text-sm"
                                            data-testid={`${baseId}-field-${col.name}-label`}
                                          >
                                            {col.label}
                                            {col.required && (
                                              <span className="text-primary ml-1">
                                                *
                                              </span>
                                            )}
                                          </label>

                                          {String(col.inputType) ===
                                          "select" ? (
                                            <Controller
                                              control={control}
                                              name={col.name}
                                              render={({ field }) => {
                                                const options =
                                                  col.options ||
                                                  selectOptions.find(
                                                    (s) => s.name === col.name,
                                                  )?.options ||
                                                  [];

                                                return (
                                                  <Select
                                                    onValueChange={(val) => {
                                                      field.onChange(val);
                                                      onSelectChange?.({
                                                        value: val,
                                                        label: col.label,
                                                      });
                                                    }}
                                                    value={String(
                                                      field.value ?? "",
                                                    )}
                                                  >
                                                    <SelectTrigger
                                                      className={cn(
                                                        "mt-2 w-full text-sm",
                                                        fieldError
                                                          ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                                                          : "border-border focus-visible:ring-ring focus-visible:ring-1",
                                                      )}
                                                      data-testid={`${baseId}-select-${col.name}`}
                                                    >
                                                      <SelectValue
                                                        placeholder={
                                                          col.placeholder ||
                                                          "Selecione..."
                                                        }
                                                      />
                                                    </SelectTrigger>
                                                    <SelectContent
                                                      data-testid={`${baseId}-select-${col.name}-content`}
                                                    >
                                                      {options.map((opt) => (
                                                        <SelectItem
                                                          key={opt.value}
                                                          value={opt.value}
                                                          data-testid={`${baseId}-select-${col.name}-option-${opt.value}`}
                                                        >
                                                          {opt.label}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                );
                                              }}
                                            />
                                          ) : String(col.inputType) ===
                                            "date" ? (
                                            <Controller
                                              control={control}
                                              name={col.name}
                                              render={() => (
                                                <Input
                                                  {...reg}
                                                  placeholder={col.placeholder}
                                                  aria-invalid={!!fieldError}
                                                  type="datetime-local"
                                                  className={cn(
                                                    "mt-2 text-sm",
                                                    fieldError
                                                      ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                                                      : "border-border focus-visible:ring-ring focus-visible:ring-1",
                                                  )}
                                                  data-testid={`${baseId}-input-${col.name}`}
                                                />
                                              )}
                                            />
                                          ) : (
                                            <div
                                              className="relative"
                                              data-testid={`${baseId}-input-${col.name}-wrapper`}
                                            >
                                              <Input
                                                {...reg}
                                                placeholder={col.placeholder}
                                                aria-invalid={!!fieldError}
                                                className={cn(
                                                  "mt-2 pr-10 text-sm",
                                                  fieldError
                                                    ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                                                    : "border-border focus-visible:ring-ring focus-visible:ring-1",
                                                )}
                                                data-testid={`${baseId}-input-${col.name}`}
                                              />
                                              {col.iconInput && (
                                                <div
                                                  className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
                                                  data-testid={`${baseId}-input-${col.name}-icon`}
                                                >
                                                  <span className="text-muted-foreground mt-2 text-sm">
                                                    {IconInput(col.iconInput)}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  (() => {
                                    const reg = register(nameKey);
                                    const commonClass = cn(
                                      "mt-2 text-sm",
                                      fieldError
                                        ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                                        : "border-border focus-visible:ring-ring focus-visible:ring-1",
                                    );

                                    return (
                                      <Input
                                        {...reg}
                                        type={inp.inputType || "text"}
                                        placeholder={inp.placeholder}
                                        className={commonClass}
                                        aria-invalid={!!fieldError}
                                        inputMode={
                                          nameKey === "numero"
                                            ? "numeric"
                                            : undefined
                                        }
                                        pattern={
                                          nameKey === "numero"
                                            ? "[0-9]*"
                                            : nameKey === "desconto"
                                              ? "[0-9]*"
                                              : undefined
                                        }
                                        maxLength={
                                          nameKey === "cep"
                                            ? 9
                                            : nameKey === "desconto"
                                              ? 2
                                              : 100
                                        }
                                        data-testid={`${baseId}-input-${inp.name}`}
                                        onChange={(
                                          e: React.ChangeEvent<HTMLInputElement>,
                                        ) => {
                                          if (nameKey === "cep") {
                                            const raw = String(
                                              e.target.value || "",
                                            );
                                            const digits = raw
                                              .replace(/\D/g, "")
                                              .slice(0, 8);
                                            const formatted =
                                              digits.length > 5
                                                ? `${digits.slice(0, 5)}-${digits.slice(5)}`
                                                : digits;

                                            try {
                                              (
                                                e.target as HTMLInputElement
                                              ).value = formatted;
                                            } catch {}

                                            if (
                                              typeof (
                                                reg as { onChange?: unknown }
                                              ).onChange === "function"
                                            ) {
                                              (
                                                reg as {
                                                  onChange: (
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                  ) => void;
                                                }
                                              ).onChange(e);
                                            } else {
                                              setValue(nameKey, formatted, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              });
                                            }
                                          } else if (nameKey === "numero") {
                                            const raw = String(
                                              e.target.value || "",
                                            );
                                            const digits = raw.replace(
                                              /\D/g,
                                              "",
                                            );
                                            try {
                                              (
                                                e.target as HTMLInputElement
                                              ).value = digits;
                                            } catch {}
                                            if (
                                              typeof (
                                                reg as { onChange?: unknown }
                                              ).onChange === "function"
                                            ) {
                                              (
                                                reg as {
                                                  onChange: (
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                  ) => void;
                                                }
                                              ).onChange(e);
                                            } else {
                                              setValue(nameKey, digits, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              });
                                            }
                                          } else {
                                            if (
                                              typeof (
                                                reg as { onChange?: unknown }
                                              ).onChange === "function"
                                            ) {
                                              (
                                                reg as {
                                                  onChange: (
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                  ) => void;
                                                }
                                              ).onChange(e);
                                            } else {
                                              setValue(nameKey, e.target.value);
                                            }
                                          }
                                        }}
                                      />
                                    );
                                  })()
                                )}

                                {fieldError && (
                                  <p
                                    className="text-xs text-red-500"
                                    data-testid={`${baseId}-error-${inp.name}`}
                                  >
                                    {fieldError.message}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}

                  {orderBump && (
                    <>
                      <div
                        className="mt-6 mb-2"
                        data-testid={`${baseId}-orderbump-preview`}
                      >
                        <p
                          className="text-foreground mb-2 text-sm"
                          data-testid={`${baseId}-orderbump-preview-title`}
                        >
                          Prévia
                        </p>
                        <div
                          className="rounded-md border p-5"
                          data-testid={`${baseId}-orderbump-preview-card`}
                        >
                          <p
                            className="bg-error text-foreground rounded-t-md p-2 text-center text-sm font-medium break-all"
                            data-testid={`${baseId}-orderbump-preview-description`}
                          >
                            {watch("descricao") || "Descrição"}
                          </p>
                          <div className="rounded-b-md bg-gray-200 p-3">
                            <div className="bg-foreground flex items-center gap-2 rounded-lg border p-2">
                              <Checkbox
                                checked={false}
                                className="border-muted-foreground h-4 w-4 bg-gray-100!"
                                data-testid={`${baseId}-orderbump-preview-checkbox`}
                              />
                              <div className="flex flex-col gap-1">
                                <p
                                  className="text-error text-xs break-all"
                                  data-testid={`${baseId}-orderbump-preview-name-offer`}
                                >
                                  {nameOffer ||
                                    "DE R$197,00 POR APENAS R$97,00"}
                                </p>
                                <p
                                  className={`text-xs break-all ${isLightTheme ? "text-white" : "text-black"}`}
                                  data-testid={`${baseId}-orderbump-preview-cta`}
                                >
                                  {watch("cta") ||
                                    "Adquira o acelerador de resultados preço exclusivo nessa oferta"}
                                </p>
                                <p
                                  className="text-muted-foreground text-xs"
                                  data-testid={`${baseId}-orderbump-preview-price`}
                                >
                                  R${" "}
                                  {new Intl.NumberFormat("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(valorOferta / 100)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {passwordStrength && (
                    <>
                      <div
                        className="mt-6 mb-2"
                        data-testid={`${baseId}-password-section`}
                      >
                        <h2
                          className="text-md text-foreground flex items-center justify-between font-bold"
                          data-testid={`${baseId}-password-section-title`}
                        >
                          Senha
                          <button
                            type="button"
                            onClick={() => {
                              setShowPassword(!showPassword);
                              setShowConfirmPassword(!showConfirmPassword);
                            }}
                            className="text-foreground hover:text-muted-foreground flex items-center gap-1.5 text-xs transition-colors"
                            data-testid={`${baseId}-button-toggle-password-visibility`}
                          >
                            {showPassword ? (
                              <Eye className="size-4" />
                            ) : (
                              <EyeOff className="size-4" />
                            )}
                            {showPassword ? "Ocultar senha" : "Mostrar senha"}
                          </button>
                        </h2>
                      </div>

                      <div className="space-y-1.5">
                        <div className="relative">
                          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Senha"
                            {...register("password")}
                            disabled={isSubmitting}
                            className={`bg-input text-foreground placeholder:text-muted-foreground pr-10 pl-9 ${
                              (errors as FieldErrors<FormValues>).password
                                ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                                : "border-border focus-visible:ring-ring focus-visible:ring-1"
                            }`}
                            aria-invalid={
                              !!(errors as FieldErrors<FormValues>).password
                            }
                            data-testid={`${baseId}-input-password`}
                          />
                        </div>
                      </div>

                      <div className="mt-5 space-y-1.5">
                        <div className="relative">
                          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                          <Input
                            id="passwordConfirmation"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmar senha"
                            {...register("passwordConfirmation")}
                            disabled={isSubmitting}
                            className={`bg-input text-foreground placeholder:text-muted-foreground pr-10 pl-9 ${
                              (errors as FieldErrors<FormValues>)
                                .passwordConfirmation
                                ? "border border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                                : "border-border focus-visible:ring-ring focus-visible:ring-1"
                            }`}
                            aria-invalid={
                              !!(errors as FieldErrors<FormValues>)
                                .passwordConfirmation
                            }
                            data-testid={`${baseId}-input-password-confirmation`}
                          />
                        </div>
                        {(errors as FieldErrors<FormValues>)
                          .passwordConfirmation && (
                          <p
                            className="text-xs text-red-500"
                            data-testid={`${baseId}-error-password-confirmation`}
                          >
                            {
                              (
                                (errors as FieldErrors<FormValues>)
                                  .passwordConfirmation as { message?: string }
                              )?.message
                            }
                          </p>
                        )}
                      </div>

                      {password && (
                        <div
                          className="mt-5"
                          data-testid={`${baseId}-password-strength`}
                        >
                          <PasswordStrength password={password} />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <DialogFooter
                  className={cn(
                    "border-border mt-4 flex w-full shrink-0 flex-col gap-4 border-t pt-4 sm:flex-row sm:space-x-4",
                    variant === "clean" && "border-none",
                  )}
                  data-testid={`${baseId}-footer`}
                >
                  {cancelButton && !forceConfirm && (
                    <DialogClose asChild>
                      <Button
                        variant={cancelButton.variant}
                        className={cn(
                          "bg-muted/80 text-foreground w-full rounded-lg py-3 no-underline hover:no-underline sm:flex-1",
                        )}
                        data-testid={`${baseId}-button-cancel`}
                      >
                        {cancelButton.label}
                      </Button>
                    </DialogClose>
                  )}

                  {submitButton && (
                    <Button
                      type="submit"
                      variant={submitButton.variant}
                      className={cn(
                        "w-full rounded-lg py-3 sm:flex-1",
                        isAccountRemove || destructiveSubmit
                          ? "bg-red-500 text-white transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 active:bg-red-800"
                          : "bg-primary text-primary-foreground",
                      )}
                      disabled={!isValid || isSubmitting || isPending}
                      data-testid={`${baseId}-button-submit`}
                    >
                      {isSubmitting || isPending ? (
                        <div
                          className="flex items-center gap-2"
                          data-testid={`${baseId}-button-submit-loading`}
                        >
                          <div
                            className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"
                            data-testid={`${baseId}-button-submit-spinner`}
                          />
                          {getLoadingLabel()}
                        </div>
                      ) : (
                        submitButton.label
                      )}
                    </Button>
                  )}
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CustomModalForm;
