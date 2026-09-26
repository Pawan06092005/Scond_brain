import { useRef, useState } from "react"; // Importing React hooks for state management and refs
import { CrossIcon } from "../icons/CrossIcon"; // Importing the close icon
import { Button } from "./Button"; // Importing the Button component
import { Input } from "./Input"; // Importing the Input component for form inputs
import { BACKEND_URL } from "../config"; // Importing the backend URL for API requests
import axios from "axios"; // Importing axios for HTTP requests

// Enum to represent different types of content
const ContentType = {
    Youtube: "youtube",
    Twitter: "twitter",
    Notes: "notes"
} as const;

// Interface for the props passed to the CreateContentModal component
interface CreateContentModalProps {
    open: boolean; // State to determine if the modal is open
    onClose: () => void; // Function to close the modal
    onAddContent?: (item: any) => void;
}

// CreateContentModal component definition
export function CreateContentModal({ open, onClose, onAddContent }: CreateContentModalProps) {
    // References to the input fields for title and link
    const titleRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLInputElement>(null);
    const noteRef = useRef<HTMLTextAreaElement>(null);
    // State to manage the selected content type
    const [type, setType] = useState<"youtube" | "twitter" | "notes">(ContentType.Youtube);

    // Function to handle adding new content
    async function addContent() {
        const title = titleRef.current?.value; // Getting the title value from the input
        const link = linkRef.current?.value; // Getting the link value from the input
        const text = noteRef.current?.value;

        // Making a POST request to add new content
        const response = await axios.post(`${BACKEND_URL}/api/v1/content`, {
            link,
            text,
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
        onClose();
    }

    return (
        <div>
            {open && (
                // Modal background overlay
                <div>
                    <div className="w-screen h-screen bg-slate-500 fixed top-0 left-0 opacity-60 flex justify-center"></div>
                    {/* Modal content container */}
                    <div className="w-screen h-screen fixed top-0 left-0 flex justify-center">
                        <div className="flex flex-col justify-center">
                            <span className="bg-white opacity-100 p-4 rounded fixed">
                                {/* Close button */}
                                <div className="flex justify-end">
                                    <div onClick={onClose} className="cursor-pointer">
                                        <CrossIcon />
                                    </div>
                                </div>
                                {/* Input fields for title and content */}
                                <div>
                                    <Input ref={titleRef} placeholder="Title" />
                                    {type === ContentType.Notes ? (
                                        <textarea
                                            ref={noteRef}
                                            className="mt-2 min-h-32 w-full rounded-md border border-gray-300 p-2 outline-none focus:border-purple-500"
                                            placeholder="Write your note..."
                                        />
                                    ) : (
                                        <Input ref={linkRef} placeholder="Link" />
                                    )}
                                </div>
                                {/* Content type selection */}
                                <div>
                                    <h1>Type</h1>
                                    <div className="flex gap-1 justify-center pb-2">
                                        {/* Button to select YouTube type */}
                                        <Button
                                            text="Youtube"
                                            variant={type === ContentType.Youtube ? "primary" : "secondary"}
                                            onClick={() => setType(ContentType.Youtube)}
                                        />
                                        {/* Button to select Twitter type */}
                                        <Button
                                            text="Twitter"
                                            variant={type === ContentType.Twitter ? "primary" : "secondary"}
                                            onClick={() => setType(ContentType.Twitter)}
                                        />
                                        <Button
                                            text="Notes"
                                            variant={type === ContentType.Notes ? "primary" : "secondary"}
                                            onClick={() => setType(ContentType.Notes)}
                                        />
                                    </div>
                                </div>
                                {/* Submit button */}
                                <div className="flex justify-center">
                                    <Button onClick={addContent} variant="primary" text="Submit" />
                                </div>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}