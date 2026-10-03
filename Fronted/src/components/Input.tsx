import { forwardRef } from "react";

// Defining the InputProps interface to specify the types for the props
interface InputProps {
    placeholder: string; // Placeholder text for the input field
    type?: string; // Optional type for the input field
    label?: string; // Optional label shown above the field
}

// Input component definition
export const Input = forwardRef<HTMLInputElement, InputProps>(({placeholder, type, label}, ref) => {
    return (
        <label className="block">
            {label && <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>}
            <input
                ref={ref} // Attaching the reference to the input field
                placeholder={placeholder} // Setting the placeholder text for the input field
                type={type || "text"} // Defining the input type as text by default
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
            />
        </label>
    );
});
