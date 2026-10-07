import { useEffect, useRef, useState, type FormEvent } from "react"; // Importing React hooks for state management and refs
import { CrossIcon } from "../icons/CrossIcon"; // Importing the close icon
import { Button } from "./Button"; // Importing the Button component
import { Input } from "./Input"; // Importing the Input component for form inputs
import axios from "axios"; // Importing axios for HTTP requests
import { contentTypeOrder, contentTypes, type ContentItem, type ContentType } from "../contentTypes";

// Backend URL comes from VITE_BACKEND_URL in Fronted/.env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Interface for the props passed to the CreateContentModal component
interface CreateContentModalProps {
    open: boolean; // State to determine if the modal is open
    onClose: () => void; // Function to close the modal
    onAddContent?: (item: ContentItem) => void;
}

// Google Forms links shared on WhatsApp look like forms.gle/... or docs.google.com/forms/...
function isGoogleFormLink(link: string): boolean {
    try {
        const url = new URL(link);
        return url.hostname === "forms.gle"
            || (url.hostname === "docs.google.com" && url.pathname.startsWith("/forms/"));
    } catch {
        return false;
    }
}

const textareaClass = "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100";

// CreateContentModal component definition
export function CreateContentModal({ open, onClose, onAddContent }: CreateContentModalProps) {
    // References to the input fields for title and link
    const titleRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLInputElement>(null);
    const noteRef = useRef<HTMLTextAreaElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    // State to manage the selected content type
    const [type, setType] = useState<ContentType>("youtube");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Close the modal and forget any old error message
    const close = () => {
        setError("");
        onClose();
    };

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") close();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    });

    // Function to handle adding new content
    async function addContent(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const title = titleRef.current?.value.trim(); // Getting the title value from the input
        const link = linkRef.current?.value.trim(); // Getting the link value from the input
        const text = noteRef.current?.value.trim();
        const description = descriptionRef.current?.value.trim();

        if (!title) {
            setError("Please add a title.");
            return;
        }
        if (type === "notes" ? !text : !link) {
            setError(type === "notes" ? "Your note is empty." : "Please paste a link.");
            return;
        }

        if (type === "forms" && link && !isGoogleFormLink(link)) {
            setError("That doesn't look like a Google Form link (forms.gle/... or docs.google.com/forms/...).");
            return;
        }

        setError("");
        setLoading(true);
        try {
            // Making a POST request to add new content
            const response = await axios.post(`${BACKEND_URL}/api/v1/content`, {
                link,
                text,
                description,
                title,
                type
            }, {
                headers: {
                    "Authorization": localStorage.getItem("token") || "" // Including the authorization token
                }
            });

            if (onAddContent) {
                onAddContent(response.data);
            }

            // Closing the modal after adding content
            close();
        } catch {
            setError("Could not save. Make sure you are signed in and try again.");
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Modal background overlay */}
            <div
                onClick={close}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in"
            ></div>

            {/* Modal content container */}
            <form
                onSubmit={addContent}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-content-title"
                className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-pop-in"
            >
                {/* Header with close button */}
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h2 id="add-content-title" className="text-lg font-semibold text-gray-900">Add to your brain</h2>
                        <p className="text-sm text-gray-500">Save a link or jot down a note.</p>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close"
                        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                        <CrossIcon />
                    </button>
                </div>

                {/* Content type selection */}
                <div className="mb-5 grid grid-cols-5 gap-2">
                    {contentTypeOrder.map((option) => {
                        const selected = type === option;
                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setType(option)}
                                aria-pressed={selected}
                                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-all duration-200
                                    ${selected
                                        ? "border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-100"
                                        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"}`}
                            >
                                {contentTypes[option].icon}
                                {contentTypes[option].label}
                            </button>
                        );
                    })}
                </div>

                {/* Input fields for title and content */}
                <div className="flex flex-col gap-4">
                    <Input ref={titleRef} label="Title" placeholder="Give it a name you'll remember" />
                    {type === "notes" ? (
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-gray-700">Note</span>
                            <textarea
                                ref={noteRef}
                                className={`${textareaClass} min-h-32`}
                                placeholder="Write your note..."
                            />
                        </label>
                    ) : (
                        <>
                            <Input ref={linkRef} label="Link" placeholder={contentTypes[type].placeholder} />
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Description <span className="font-normal text-gray-400">(optional)</span>
                                </span>
                                <textarea
                                    ref={descriptionRef}
                                    className={`${textareaClass} min-h-20`}
                                    placeholder="Why is this worth saving?"
                                />
                            </label>
                        </>
                    )}
                </div>

                {error && (
                    <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
                )}

                {/* Footer buttons */}
                <div className="mt-6 flex justify-end gap-2">
                    <Button onClick={close} variant="ghost" text="Cancel" />
                    <Button type="submit" variant="primary" text={loading ? "Saving..." : "Save"} loading={loading} />
                </div>
            </form>
        </div>
    );
}
