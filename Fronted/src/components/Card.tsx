import { useEffect, useRef, useState } from "react";
import { DeleteIcon } from "../icons/DeleteIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { ExternalLinkIcon } from "../icons/ExternalLinkIcon";
import { LinkedinIcon } from "../icons/Linkdin";
import { FormsIcon } from "../icons/FormsIcon";
import { contentTypes, type ContentType } from "../contentTypes";

interface CardProps {
    id?: string;
    title: string;
    link: string;
    text?: string;
    description?: string;
    type: ContentType;
    onDelete?: (id: string) => void;
    onShare?: (id: string, title: string) => void;
    readOnly?: boolean;   // shared pages: hide share + delete
    expanded?: boolean;   // single-item share page: bigger card, no inner scroll
}

// Turns a LinkedIn post link into an embeddable URL.
// Post links look like:
//   https://www.linkedin.com/posts/user_slug-activity-7123456789012345678-AbCd
//   https://www.linkedin.com/feed/update/urn:li:activity:7123456789012345678/
// Returns null when no post id is found (e.g. profile links).
function getLinkedInEmbedUrl(link: string): string | null {
    const urnMatch = link.match(/urn:li:(activity|share|ugcPost):(\d+)/);
    if (urnMatch) {
        return `https://www.linkedin.com/embed/feed/update/urn:li:${urnMatch[1]}:${urnMatch[2]}`;
    }

    const activityMatch = link.match(/activity-(\d+)/);
    if (activityMatch) {
        return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityMatch[1]}`;
    }

    return null;
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

// "https://www.youtube.com/watch?v=..." -> "youtube.com"
function getDomain(link: string): string {
    try {
        return new URL(link).hostname.replace(/^www\./, "");
    } catch {
        return link;
    }
}

export function Card({ id, title, link, text, description, type, onDelete, onShare, readOnly, expanded }: CardProps) {
    const tweetRef = useRef<HTMLDivElement>(null);
    // First click on delete asks for confirmation, second click deletes
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    // Render the tweet inside this card once the Twitter widget script is ready
    useEffect(() => {
        if (type === "twitter" && (window as any).twttr?.widgets) {
            (window as any).twttr.widgets.load(tweetRef.current);
        }
    }, [type, link]);

    // Reset the confirm state if the user doesn't click again
    useEffect(() => {
        if (!confirmingDelete) return;
        const timer = setTimeout(() => setConfirmingDelete(false), 3000);
        return () => clearTimeout(timer);
    }, [confirmingDelete]);

    const meta = contentTypes[type];
    const linkedInEmbedUrl = type === "linkedin" ? getLinkedInEmbedUrl(link) : null;

    const handleDelete = () => {
        if (!id || !onDelete) return;
        if (confirmingDelete) {
            onDelete(id);
        } else {
            setConfirmingDelete(true);
        }
    };

    return (
        <article className={`group relative flex w-full flex-col ${expanded ? "" : "h-[24rem]"} overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-900/10 animate-card-in`}>
            {/* Colour strip that tells the content type at a glance */}
            <div className={`h-1 w-full shrink-0 ${meta.accentClass} opacity-80 transition-opacity group-hover:opacity-100`} />

            {/* Header Section */}
            <header className="flex shrink-0 items-start gap-3 px-4 pt-4 pb-3">
                {/* Type logo */}
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-black/5 transition-transform duration-300 group-hover:scale-105 ${meta.chipClass}`}>
                    {meta.icon}
                </div>

                {/* Type label + title */}
                <div className="min-w-0 flex-1">
                    <div className={`text-[11px] font-semibold uppercase tracking-wider ${meta.labelClass}`}>
                        {meta.label}
                    </div>
                    <h3 className={`mt-0.5 font-semibold leading-snug text-gray-900 ${expanded ? "text-lg" : "line-clamp-2 text-[15px]"}`} title={title}>
                        {title}
                    </h3>
                </div>

                {/* Share + Delete: fade in on hover where hovering is possible, always visible on touch screens */}
                {!readOnly && (
                <div className={`flex shrink-0 items-center gap-0.5 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100 ${confirmingDelete ? "" : "[@media(hover:hover)]:opacity-0"}`}>
                    {onShare && id && (
                        <button
                            type="button"
                            onClick={() => onShare(id, title)}
                            aria-label="Share"
                            title="Share"
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600"
                        >
                            <ShareIcon />
                        </button>
                    )}
                    {onDelete && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        aria-label={confirmingDelete ? "Confirm delete" : "Delete"}
                        title={confirmingDelete ? "Click again to delete" : "Delete"}
                        className={`flex items-center gap-1 rounded-lg p-2 text-xs font-medium transition-all duration-200 [&_svg]:size-4 ${confirmingDelete
                            ? "bg-red-600 px-2.5 text-white shadow-sm hover:bg-red-700"
                            : "text-gray-400 hover:bg-red-50 hover:text-red-600"}`}
                    >
                        <DeleteIcon />
                        {confirmingDelete && "Delete?"}
                    </button>
                    )}
                </div>
                )}
            </header>

            {/* Content Section */}
            <div className={`flex-1 px-4 pb-4 ${expanded ? "" : "thin-scroll overflow-y-auto"}`}>
                {/* Note content */}
                {type === "notes" && (
                    <p className="whitespace-pre-wrap break-words rounded-xl bg-purple-50/40 p-3.5 text-sm leading-relaxed text-gray-700 ring-1 ring-inset ring-purple-100/70">{text}</p>
                )}

                {/* YouTube embed */}
                {type === "youtube" && (
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
                        <iframe
                            className="h-full w-full"
                            src={getYouTubeEmbedUrl(link)}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* Twitter / X embed */}
                {type === "twitter" && (
                    <div ref={tweetRef} className="w-full [&_.twitter-tweet]:!my-0">
                        <blockquote className="twitter-tweet">
                            <a href={link.replace("x.com", "twitter.com")}></a>
                        </blockquote>
                    </div>
                )}

                {/* LinkedIn embed */}
                {type === "linkedin" && (
                    linkedInEmbedUrl ? (
                        <div className={`w-full overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-200 ${expanded ? "h-[36rem]" : "h-64"}`}>
                            <iframe
                                className="h-full w-full"
                                src={linkedInEmbedUrl}
                                title="LinkedIn post"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sky-700 transition-colors hover:bg-sky-100"
                        >
                            <LinkedinIcon />
                            <div className="min-w-0">
                                <div className="text-sm font-semibold">Open on LinkedIn</div>
                                <div className="truncate text-xs text-sky-600/80">{link}</div>
                            </div>
                        </a>
                    )
                )}

                {/* Google Form - opens in a new tab so it can be filled in */}
                {type === "forms" && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/form block overflow-hidden rounded-xl ring-1 ring-violet-100 transition-shadow hover:shadow-md hover:shadow-violet-900/10"
                    >
                        <div className="flex items-center gap-3 bg-gradient-to-br from-violet-600 to-purple-600 px-4 py-5 text-white [&_svg]:size-7">
                            <FormsIcon />
                            <div className="min-w-0">
                                <div className="text-sm font-semibold">Google Form</div>
                                <div className="truncate text-xs text-white/80">{getDomain(link)}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 bg-violet-50/60 px-4 py-3 text-sm font-medium text-violet-700 transition-colors group-hover/form:bg-violet-100/70 [&_svg]:size-4">
                            Open form
                            <ExternalLinkIcon />
                        </div>
                    </a>
                )}

                {description && (
                    <p className="mt-3 whitespace-pre-wrap break-words border-l-2 border-gray-200 pl-3 text-sm leading-relaxed text-gray-600">
                        {description}
                    </p>
                )}
            </div>

            {/* Footer: where the link points to - click to open the original */}
            {type !== "notes" && link && (
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open original"
                    className="flex shrink-0 items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/70 px-4 py-2.5 text-xs text-gray-500 transition-colors hover:bg-purple-50 hover:text-purple-700 [&_svg]:size-3.5"
                >
                    <span className="truncate font-medium">{getDomain(link)}</span>
                    <span className="flex shrink-0 items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                        Open
                        <ExternalLinkIcon />
                    </span>
                </a>
            )}
        </article>
    );
}
