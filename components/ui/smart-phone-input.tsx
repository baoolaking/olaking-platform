"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { transformPhoneNumber, formatPhoneForDisplay, getFormatDescription } from "@/lib/utils/phone";
import { CheckCircle2, AlertCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function SmartPhoneInput({
  value,
  onChange,
  onBlur,
  error,
  label = "WhatsApp Number",
  placeholder = "09087654322, 7098765412, or +2347098765412",
  className
}: SmartPhoneInputProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [transformResult, setTransformResult] = useState(transformPhoneNumber(value));
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const result = transformPhoneNumber(displayValue);
    setTransformResult(result);
  }, [displayValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Transform and pass the formatted value to parent
    const result = transformPhoneNumber(inputValue);
    if (result.isValid) {
      onChange(result.formatted);
    } else {
      onChange(inputValue);
    }
  };

  const handleFocus = () => {
    setShowPreview(true);
  };

  const handleBlur = () => {
    setShowPreview(false);
    onBlur?.();
  };

  const getStatusIcon = () => {
    if (!displayValue) return <Phone className="h-4 w-4 text-muted-foreground" />;

    if (transformResult.isValid) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else if (displayValue.length > 0) {
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }

    return <Phone className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusColor = () => {
    if (!displayValue) return "";

    if (transformResult.isValid) {
      return "border-green-500 focus:border-green-500";
    } else if (displayValue.length > 0) {
      return "border-amber-500 focus:border-amber-500";
    }

    return "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="whatsapp_no" className="text-sm font-medium">
        {label}
      </Label>

      <div className="relative">
        <Input
          id="whatsapp_no"
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "pr-10 transition-colors",
            getStatusColor(),
            error && "border-red-500 focus:border-red-500"
          )}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {getStatusIcon()}
        </div>
      </div>

      {/* Real-time preview */}
      {showPreview && displayValue && (
        <div className="text-xs space-y-1 p-2 bg-muted rounded-md border">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Format detected:</span>
            <span className="font-medium">{getFormatDescription(transformResult.originalFormat)}</span>
          </div>

          {transformResult.isValid && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Will be saved as:</span>
              <span className="font-mono text-green-600">
                {formatPhoneForDisplay(transformResult.formatted)}
              </span>
            </div>
          )}

          {!transformResult.isValid && displayValue.length > 0 && (
            <div className="text-amber-600">
              <span>⚠️ Format not recognized. Supported: 09087654322, 7098765412, +2347098765412</span>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Help text */}
      {!error && !showPreview && (
        <p className="text-xs text-muted-foreground">
          Enter your number in any format: 09087654322, 7098765412, or +2347098765412
        </p>
      )}
    </div>
  );
}