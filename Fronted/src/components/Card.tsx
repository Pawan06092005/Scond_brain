import { useEffect } from "react";
import { DeleteIcon } from "../icons/DeleteIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { Button } from "./Button";

interface CardProps {
    id?: string;
    title: string;
    link: string;
    text?: string;
    type: "twitter" | "youtube" | "notes";
    onDelete: (id: string) => void;
}



function getYouTubeEmbedUrl(link: string): string {
    try {
        const url = new URL(link);
        let videoId = "";

        if (url.hostname === "youtu.be") {
            // Short URL: https://youtu.be/VIDEO_ID
            videoId = url.pathname.slice(1);
        } else {
            // Standard URL: https://www.youtube.com/watch?v=VIDEO_ID
            videoId = url.searchParams.get("v") || "";
        }

        if (!videoId) return link; // fallback
        return `https://www.youtube.com/embed/${videoId}`;
    } catch {
        return link; // if URL parsing fails, return as-is
    }
}

export function Card({ id, title, link, text, type, onDelete }: CardProps) {
    // Re-run Twitter widget loader every time a Twitter card mounts
    useEffect(() => {
        if (type === "twitter" && (window as any).twttr?.widgets) {
            (window as any).twttr.widgets.load();
        }
    }, [type, link]);

    return (
        <div>
            <div className="p-4 bg-white rounded-md border-gray-200 max-w-72 border min-h-48 min-w-72 ">
                {/* Header Section */}
                <div className="flex justify-between ">
                    {/* Left: Title */}
                    <div className="flex items-center text-md">
                        {title}
                    </div>

                    {/* Right: Open link + Delete */}
                    <div className="flex items-center">
                        {type !== "notes" && <div className="pr-2 text-gray-500">
                            {/* Opens the original link in a new tab */}
                            <a href={link} target="_blank" rel="noopener noreferrer">
                                <ShareIcon />
                            </a>
                        </div>}
                        <div className="text-gray-500">
                            <Button
                                onClick={() => id && onDelete(id)}
                                startIcon={<DeleteIcon />}
                                size="sm"
                                variant="secondary"
                                text=" "
                            />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="pt-4 hover:bg-purple-100 rounded-lg pb-4  m-1 ">
                    {/* Note content */}
                    {type === "notes" && (
                        <p className="whitespace-pre-wrap break-words text-gray-700">{text}</p>
                    )}

                    {/* YouTube embed */}
                    {type === "youtube" && (
                        <iframe
                            className="w-full"
                            src={getYouTubeEmbedUrl(link)}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    )}

                    {/* Twitter / X embed */}
                    {type === "twitter" && (
                        <blockquote className="twitter-tweet">
                            <a href={link.replace("x.com", "twitter.com")}></a>
                        </blockquote>
                    )}
                </div>
            </div>
        </div>
    );
}