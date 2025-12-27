"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

export interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showPassword = false, onTogglePassword, ...props }, ref) => {
    const [internalShowPassword, setInternalShowPassword] = React.useState(false);

    // Use controlled state if provided, otherwise use internal state
    const isPasswordVisible = showPassword !== undefined ? showPassword : internalShowPassword;
    const togglePassword = onTogglePassword || (() => setInternalShowPassword(!internalShowPassword));

    return (
      <div className="relative">
        <Input
          type={isPasswordVisible ? "text" : "password"}
          className={cn("pr-12", className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={togglePassword}
          className={cn(
            "absolute right-0 top-0 h-full px-3 py-2",
            "flex items-center justify-center",
            "text-muted-foreground hover:text-foreground",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md",
            // Mobile-specific improvements
            "min-w-[44px] min-h-[44px]", // Better touch targets on mobile
            "md:min-w-[36px] md:min-h-[36px]" // Smaller on desktop
          )}
          tabIndex={-1}
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
        >
          {isPasswordVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };