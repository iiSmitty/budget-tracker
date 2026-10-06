import { ComponentProps } from "react";

type ButtonVariant = "primary" | "soft" | "secondary" | "danger" | "success" | "ghost" | "ghost-danger";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";

interface ButtonProps extends ComponentProps<"button"> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-primary hover:bg-primary-hover text-white focus-visible:ring-primary",
    // Tinted: stands out from neutral controls without competing with the primary action
    soft:
        "bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-500/25 dark:hover:bg-indigo-500/35 dark:text-indigo-100 focus-visible:ring-primary",
    secondary:
        "bg-surface hover:bg-surface-muted text-fg border border-border-strong focus-visible:ring-primary",
    danger: "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-500",
    ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg focus-visible:ring-primary",
    "ghost-danger":
        "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 focus-visible:ring-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
    xs: "h-7 px-2 text-sm",
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 shrink-0",
    "icon-sm": "h-9 w-9 shrink-0",
};

// The app's single button style, so every button shares focus, disabled and colour behaviour
const Button = ({
                    variant = "secondary",
                    size = "md",
                    type = "button",
                    className = "",
                    ...props
                }: ButtonProps) => (
    <button
        type={type}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
    />
);

export default Button;
