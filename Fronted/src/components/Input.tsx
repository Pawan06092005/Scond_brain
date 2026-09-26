import { forwardRef } from "react";

// Defining the InputProps interface to specify the types for the props
interface InputProps { 
    placeholder: string; // Placeholder text for the input field
    type?: string; // Optional type for the input field
}

// Input component definition
export const Input = forwardRef<HTMLInputElement, InputProps>(({placeholder, type}, ref) => {
    return (
        <div>
            {/* Input field with the provided placeholder and reference */}
            <input 
                ref={ref} // Attaching the reference to the input field
                placeholder={placeholder} // Setting the placeholder text for the input field
                type={type || "text"} // Defining the input type as text by default
                className="px-4 py-2 border rounded m-2 w-full" // Tailwind CSS classes for styling the input field
            />
        </div>
    );
});