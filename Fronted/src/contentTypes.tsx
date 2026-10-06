import type { ReactElement } from "react";
import { YourubeIcon } from "./icons/YoutubeIcon";
import { XcomIcon } from "./icons/XcomIcon";
import { LinkedinIcon } from "./icons/Linkdin";
import { NotesIcon } from "./icons/NotesIcon";
import { FormsIcon } from "./icons/FormsIcon";

// Single place that describes every kind of content the app supports.
// Sidebar, Card and the Add Content modal all read from here.
export type ContentType = "youtube" | "twitter" | "linkedin" | "forms" | "notes";
export type ContentFilter = ContentType | "all";

export interface ContentItem {
    _id?: string;
    title: string;
    link: string;
    text?: string;
    description?: string;
    type: ContentType;
}

interface ContentTypeMeta {
    label: string;
    icon: ReactElement;
    placeholder: string;      // example link shown in the Add Content modal
    chipClass: string;        // icon chip colours on the card
    accentClass: string;      // thin colour strip along the top of the card
    labelClass: string;       // colour of the small type label on the card
}

export const contentTypes: Record<ContentType, ContentTypeMeta> = {
    youtube: {
        label: "YouTube",
        icon: <YourubeIcon />,
        placeholder: "https://www.youtube.com/watch?v=...",
        chipClass: "bg-red-50 text-red-600",
        accentClass: "bg-red-500",
        labelClass: "text-red-600",
    },
    twitter: {
        label: "X.com",
        icon: <XcomIcon />,
        placeholder: "https://x.com/user/status/...",
        chipClass: "bg-gray-100 text-gray-900",
        accentClass: "bg-gray-900",
        labelClass: "text-gray-700",
    },
    linkedin: {
        label: "LinkedIn",
        icon: <LinkedinIcon />,
        placeholder: "https://www.linkedin.com/posts/...",
        chipClass: "bg-sky-50 text-sky-700",
        accentClass: "bg-sky-600",
        labelClass: "text-sky-700",
    },
    forms: {
        label: "Forms",
        icon: <FormsIcon />,
        placeholder: "https://forms.gle/...",
        chipClass: "bg-violet-50 text-violet-700",
        accentClass: "bg-violet-600",
        labelClass: "text-violet-700",
    },
    notes: {
        label: "Notes",
        icon: <NotesIcon />,
        placeholder: "",
        chipClass: "bg-purple-50 text-purple-600",
        accentClass: "bg-purple-500",
        labelClass: "text-purple-600",
    },
};

export const contentTypeOrder: ContentType[] = ["youtube", "twitter", "linkedin", "forms", "notes"];
