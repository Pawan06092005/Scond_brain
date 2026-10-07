import { useRef } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

// Backend URL comes from VITE_BACKEND_URL in Fronted/.env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function Signup() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const signup = async () => {
    const username = (usernameRef.current?.value ?? "").trim().toLowerCase();
    const password = (passwordRef.current?.value ?? "").trim();

    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("User signed up successfully");
      window.location.href = "/signin";
      return;
    }

    alert(data.message || "Signup failed");
  };

  return (
    <div className="h-screen w-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">Sign Up</h1>

        <div className="flex flex-col gap-4">
          <Input ref={usernameRef} placeholder="Username" />
          <Input ref={passwordRef} type="password" placeholder="Password" />

          <Button variant="primary" size="md" text="Sign Up" onClick={signup} />
        </div>
      </div>
    </div>
  );
}