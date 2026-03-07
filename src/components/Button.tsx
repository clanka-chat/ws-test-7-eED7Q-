import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-bg-base font-medium hover:bg-accent-hover",
  secondary:
    "border border-border-default text-accent bg-transparent hover:bg-accent-muted",
  ghost:
    "text-text-secondary bg-transparent hover:bg-bg-surface hover:text-text-primary",
  danger:
    "bg-status-error text-white font-medium hover:bg-red-600",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-caption rounded-md gap-1.5",
  md: "h-10 px-4 text-small rounded-md gap-2",
  lg: "h-12 px-6 text-body rounded-md gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex cursor-pointer items-center justify-center transition-colors duration-150 ${variantStyles[variant]} ${sizeStyles[size]} ${
          disabled ? "pointer-events-none opacity-50" : ""
        } ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
