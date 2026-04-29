"use client";

import * as React from "react";
import { Check, ChevronDown, Phone } from "lucide-react";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { countries, getDefaultCountry, type Country } from "@/lib/countries";

function formatPhoneNumber(value: string, country: Country): string {
  const digits = value.replace(/\D/g, "");

  const limitedDigits = digits.slice(0, country.maxLength);

  if (!limitedDigits) return "";

  const format = country.format;
  let formatted = "";
  let digitIndex = 0;

  for (let i = 0; i < format.length && digitIndex < limitedDigits.length; i++) {
    if (format[i] === "#") {
      formatted += limitedDigits[digitIndex];
      digitIndex++;
    } else {
      formatted += format[i];
      if (digitIndex >= limitedDigits.length) {
        formatted = formatted.slice(0, -1);
      }
    }
  }

  return formatted;
}

export interface PhoneInputValue {
  country: Country;
  phoneNumber: string;
  fullNumber: string;
  isValid: boolean;
}

interface PhoneInputProps {
  value?: PhoneInputValue;
  onChange?: (value: PhoneInputValue) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  required?: boolean;
  "aria-label"?: string;
  id?: string;
  name?: string;
}

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  placeholder,
  className,
  required,
  "aria-label": ariaLabel = "Número de telefone",
  id,
  name,
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] =
    React.useState<Country>(getDefaultCountry());
  const [phoneNumber, setPhoneNumber] = React.useState("");

  React.useEffect(() => {
    if (value?.country) {
      setSelectedCountry(value.country);
    }
    if (value?.phoneNumber !== undefined) {
      const formatted = formatPhoneNumber(
        value.phoneNumber,
        value.country || selectedCountry,
      );
      setPhoneNumber(formatted);
    }
  }, [value, selectedCountry]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setOpen(false);

    const digits = phoneNumber.replace(/\D/g, "");
    const formattedNumber = formatPhoneNumber(digits, country);
    setPhoneNumber(formattedNumber);

    const digitsOnly = formattedNumber.replace(/\D/g, "");
    const isValid = digitsOnly.length === country.maxLength;

    onChange?.({
      country,
      phoneNumber: formattedNumber,
      fullNumber: `${country.dialCode}${digitsOnly}`,
      isValid,
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatPhoneNumber(inputValue, selectedCountry);
    setPhoneNumber(formatted);

    const digitsOnly = formatted.replace(/\D/g, "");
    const isValid = digitsOnly.length === selectedCountry.maxLength;

    onChange?.({
      country: selectedCountry,
      phoneNumber: formatted,
      fullNumber: `${selectedCountry.dialCode}${digitsOnly}`,
      isValid,
    });
  };

  const dynamicPlaceholder =
    placeholder ||
    selectedCountry?.format?.replace(/#/g, "0") ||
    "(00) 00000-0000";

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Selecionar país"
            disabled={disabled}
            className="w-30 justify-between bg-transparent px-3 font-normal"
          >
            <span className="flex items-center gap-2 truncate">
              <span className="text-base leading-none">
                {selectedCountry?.flag || "🌍"}
              </span>
              <span className="text-sm">
                {selectedCountry?.dialCode || "+55"}
              </span>
            </span>
            <ChevronDown className="ml-1 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="bg-card border-border w-70 p-0"
          align="start"
        >
          <Command className="bg-card border-0">
            <CommandInput
              placeholder="Buscar país..."
              className="border-none bg-transparent"
            />
            <CommandList className="bg-card max-h-75">
              <CommandEmpty className="text-muted-foreground">
                Nenhum país encontrado.
              </CommandEmpty>
              <CommandGroup className="bg-card **:[[cmdk-group-heading]]:text-muted-foreground">
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dialCode}`}
                    onSelect={() => handleCountrySelect(country)}
                    className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        selectedCountry?.code === country.code
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span className="mr-2 text-base leading-none">
                      {country.flag}
                    </span>
                    <span className="flex-1 truncate">{country.name}</span>
                    <span className="text-muted-foreground ml-2 text-sm">
                      {country.dialCode}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="relative flex-1">
        <Phone className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          id={id}
          name={name}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={dynamicPlaceholder}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel}
          className="pl-10"
        />
      </div>
    </div>
  );
}

export { countries, type Country };
