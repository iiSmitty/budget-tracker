import { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost" | "ghost-danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ComponentProps<"button"> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-primary hover:bg-primary-hover text-white focus-visible:ring-primary",
    secondary:
        "bg-surface-muted hover:bg-surface-hover text-fg border border-border-strong focus-visible:ring-primary",
    danger: "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-500",
    ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg focus-visible:ring-primary",
    "ghost-danger":
        "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 focus-visible:ring-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
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
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
    />
);

export default Button;
