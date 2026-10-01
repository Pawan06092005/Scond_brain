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
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-2xl hover:scale-[1.35] hover:-translate-y-2 relative z-0 hover:z-50 transition-all duration-300 w-80 h-[26rem] flex flex-col group">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4 shrink-0">
                {/* Left: Title */}
                <div className="flex items-center text-md font-semibold text-gray-800 line-clamp-2 pr-2">
                    {title}
                </div>

                {/* Right: Open link + Delete */}
                <div className="flex items-center gap-2">
                    {type !== "notes" && (
                        <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-purple-600 transition-colors"
                        >
                            <ShareIcon />
                        </a>
                    )}
                    <Button
                        onClick={() => id && onDelete(id)}
                        startIcon={<DeleteIcon />}
                        size="sm"
                        variant="secondary"
                        text=" "
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-y-auto pr-1">
                {/* Note content */}
                {type === "notes" && (
                    <p className="whitespace-pre-wrap break-words text-gray-700 text-sm leading-relaxed">{text}</p>
                )}

                {/* YouTube embed */}
                {type === "youtube" && (
                    <div className="w-full rounded-lg overflow-hidden border border-gray-100 aspect-video">
                        <iframe
                            className="w-full h-full"
                            src={getYouTubeEmbedUrl(link)}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* Twitter / X embed */}
                {type === "twitter" && (
                    <div className="w-full">
                        <blockquote className="twitter-tweet">
                            <a href={link.replace("x.com", "twitter.com")}></a>
                        </blockquote>
                    </div>
                )}
            </div>
        </div>
    );
}