import { useEffect, useRef, useState } from "react";
import { CrossIcon } from "../icons/CrossIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { Button } from "./Button";

// What is being shared: the whole brain, or one content item
export type ShareTarget =
    | { kind: "brain" }
    | { kind: "item"; id: string; title: string };

interface ShareModalProps {
    target: ShareTarget;
    onClose: () => void;
}

type Status = "loading" | "ready" | "stopped" | "error";

// Set in vite.config.ts - this laptop's address on the Wi-Fi network
declare const __LAN_ADDRESS__: string;

// "localhost" only works on this laptop, so swap it for the LAN address
// to make the link open on phones connected to the same Wi-Fi.
function shareOrigin(): string {
    const { protocol, hostname, port } = window.location;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    if (isLocal && __LAN_ADDRESS__) {
        return `${protocol}//${__LAN_ADDRESS__}${port ? `:${port}` : ""}`;
    }
    return window.location.origin;
}

// API endpoint and visitor URL for each kind of share
function shareConfig(target: ShareTarget) {
    return target.kind === "brain"
        ? { endpoint: "/api/v1/brain/share", pagePath: "/share/" }
        : { endpoint: `/api/v1/content/${target.id}/share`, pagePath: "/share/item/" };
}

async function setSharing(target: ShareTarget, share: boolean): Promise<string | undefined> {
    const response = await fetch(shareConfig(target).endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ share }),
    });
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();
    return data.hash;
}

// Mount this only while sharing (Dashboard renders it conditionally),
// so every open starts fresh and immediately creates/fetches the link.
export function ShareModal({ target, onClose }: ShareModalProps) {
    const [status, setStatus] = useState<Status>("loading");
    const [url, setUrl] = useState("");
    const [copied, setCopied] = useState(false);
    const [busy, setBusy] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const createLink = async () => {
        try {
            const hash = await setSharing(target, true);
            setUrl(`${shareOrigin()}${shareConfig(target).pagePath}${hash}`);
            setStatus("ready");
        } catch {
            setStatus("error");
        }
    };

    // Generate (or reuse) the link as soon as the modal opens
    useEffect(() => {
        createLink();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Close on Escape
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    // Hide the "Copied!" message after a moment
    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(timer);
    }, [copied]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // Clipboard API is blocked on plain http (e.g. opening the app by LAN IP) - fall back to selecting the text
            inputRef.current?.select();
            document.execCommand("copy");
        }
        setCopied(true);
    };

    const stopSharing = async () => {
        setBusy(true);
        try {
            await setSharing(target, false);
            setStatus("stopped");
        } catch {
            setStatus("error");
        } finally {
            setBusy(false);
        }
    };

    const shareAgain = async () => {
        setStatus("loading");
        await createLink();
    };

    const heading = target.kind === "brain" ? "Share your brain" : "Share this item";
    const subheading = target.kind === "brain"
        ? "Anyone with the link can view all your saved content. New items appear automatically."
        : `Anyone with the link can view “${target.title}”.`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div onClick={onClose} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in" />

            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-modal-title"
                className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-pop-in"
            >
                {/* Header */}
                <div className="mb-5 flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 [&_svg]:size-5">
                        <ShareIcon />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 id="share-modal-title" className="text-lg font-semibold text-gray-900">{heading}</h2>
                        <p className="text-sm text-gray-500">{subheading}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                        <CrossIcon />
                    </button>
                </div>

                {status === "loading" && (
                    <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
                )}

                {status === "ready" && (
                    <>
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                value={url}
                                readOnly
                                onFocus={(event) => event.target.select()}
                                aria-label="Share link"
                                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                            />
                            <Button onClick={copyLink} variant="primary" text={copied ? "Copied!" : "Copy"} />
                        </div>
                        <div className="mt-5 flex items-center justify-between">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-purple-600 hover:underline">
                                Preview link ↗
                            </a>
                            <button
                                type="button"
                                onClick={stopSharing}
                                disabled={busy}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                            >
                                {busy ? "Stopping..." : "Stop sharing"}
                            </button>
                        </div>
                    </>
                )}

                {status === "stopped" && (
                    <div className="rounded-lg bg-gray-50 p-4 text-center">
                        <p className="text-sm text-gray-600">Sharing is off. The old link no longer works.</p>
                        <div className="mt-3 flex justify-center">
                            <Button onClick={shareAgain} variant="secondary" text="Create a new link" />
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="rounded-lg bg-red-50 p-4 text-center">
                        <p className="text-sm text-red-600">Something went wrong. Make sure you are signed in.</p>
                        <div className="mt-3 flex justify-center">
                            <Button onClick={shareAgain} variant="secondary" text="Try again" />
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
