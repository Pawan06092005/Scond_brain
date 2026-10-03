// Importing ReactElement type for typing React elements like icons
import type { ReactElement } from "react";

// Defining the properties that the Button component can accept
interface ButtonProps {
    variant: "primary" | "secondary" | "ghost";
    text?: string;                 // leave empty for an icon-only button
    startIcon?: ReactElement;
    onClick?: () => void;
    fullWidth?: boolean;
    loading?: boolean;
    size?: "sm" | "md" | "lg";
    type?: "button" | "submit";
    ariaLabel?: string;
}

// Mapping button variants to their respective CSS classes
const variantClasses = {
    "primary": "bg-purple-600 text-white shadow-sm shadow-purple-600/20 hover:bg-purple-700",
    "secondary": "bg-purple-100 text-purple-700 hover:bg-purple-200",
    "ghost": "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
};

const sizeClasses = {
    "sm": "px-2.5 py-1.5 text-sm",
    "md": "px-4 py-2 text-sm",
    "lg": "px-5 py-2.5 text-sm",
};

// Default CSS classes for all buttons
const defaultStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

// The Button functional component
export function Button({ variant, text, startIcon, onClick, fullWidth, loading, size = "md", type = "button", ariaLabel }: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            aria-label={ariaLabel}
            disabled={loading}
            className={`${defaultStyles} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""}`}
        >
            {startIcon && <span className="flex items-center">{startIcon}</span>}
            {text}
        </button>
    );
}
