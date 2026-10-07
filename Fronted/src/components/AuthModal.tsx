import { useState, type FormEvent } from "react";
import { CrossIcon } from "../icons/CrossIcon";

// Backend URL comes from VITE_BACKEND_URL in Fronted/.env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export type AuthMode = "signin" | "signup";

interface AuthModalProps {
    mode: AuthMode | null;
    onModeChange: (mode: AuthMode) => void;
    onClose: () => void;
    onAuthenticated: () => Promise<void> | void;
}

export function AuthModal({ mode, onModeChange, onClose, onAuthenticated }: AuthModalProps) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!mode) return null;

    const isSigningUp = mode === "signup";

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");

        if (isSigningUp && !username.trim()) {
            setMessage("Choose a username.");
            return;
        }
        if (!email.trim() || !password.trim()) {
            setMessage("Enter both your email and password.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/${mode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Sign up sends username + email + password, sign in sends email + password
                body: JSON.stringify(isSigningUp
                    ? { username: username.trim().toLowerCase(), email: email.trim().toLowerCase(), password: password.trim() }
                    : { email: email.trim().toLowerCase(), password: password.trim() }),
            });
            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || (isSigningUp ? "Sign up failed." : "Incorrect credentials."));
                return;
            }

            if (isSigningUp) {
                setPassword("");
                setMessage("Account created. Sign in to continue.");
                onModeChange("signin");
                return;
            }

            if (!data.token) {
                setMessage("Sign in failed. Please try again.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username || email.trim().toLowerCase());
            await onAuthenticated();
            onClose();
        } catch {
            setMessage("Unable to connect. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm animate-fade-in"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-pop-in"
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2 id="auth-modal-title" className="text-xl font-semibold text-gray-800">
                        {isSigningUp ? "Create your account" : "Sign in"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-800"
                    >
                        <CrossIcon />
                    </button>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    {/* Username is only needed when creating an account */}
                    {isSigningUp && (
                        <input
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            autoComplete="username"
                            placeholder="Username"
                            aria-label="Username"
                            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                        />
                    )}
                    <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                        autoComplete="email"
                        placeholder="Email address"
                        aria-label="Email address"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                    />
                    <input
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        type="password"
                        autoComplete={isSigningUp ? "new-password" : "current-password"}
                        placeholder="Password"
                        aria-label="Password"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                    />
                    {message && <p role="status" className="text-sm text-gray-600">{message}</p>}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-purple-600/20 transition hover:bg-purple-700 active:scale-[0.98] disabled:opacity-60"
                    >
                        {isSubmitting ? "Please wait..." : isSigningUp ? "Sign up" : "Sign in"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    {isSigningUp ? "Already registered?" : "New to Brainly?"}{" "}
                    <button
                        type="button"
                        onClick={() => {
                            setMessage("");
                            onModeChange(isSigningUp ? "signin" : "signup");
                        }}
                        className="font-medium text-purple-700 hover:underline"
                    >
                        {isSigningUp ? "Sign in" : "Create an account"}
                    </button>
                </p>
            </section>
        </div>
    );
}