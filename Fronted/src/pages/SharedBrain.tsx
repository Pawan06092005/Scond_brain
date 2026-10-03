import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { SharedLayout, SharedLoading, SharedNotFound } from "../components/SharedLayout";
import { contentTypeOrder, contentTypes, type ContentFilter, type ContentItem } from "../contentTypes";

type State =
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; username: string; content: ContentItem[] };

// Public, read-only view of someone's whole brain: /share/:hash
export default function SharedBrain() {
    const { hash } = useParams();
    const [state, setState] = useState<State>({ status: "loading" });
    const [filter, setFilter] = useState<ContentFilter>("all");

    useEffect(() => {
        fetch(`/api/v1/brain/${hash}`)
            .then((response) => (response.ok ? response.json() : Promise.reject()))
            .then((data) => setState({ status: "ready", username: data.username, content: data.content }))
            .catch(() => setState({ status: "error" }));
    }, [hash]);

    if (state.status === "loading") {
        return <SharedLayout><SharedLoading /></SharedLayout>;
    }
    if (state.status === "error") {
        return <SharedLayout><SharedNotFound /></SharedLayout>;
    }

    const visible = filter === "all" ? state.content : state.content.filter((item) => item.type === filter);
    // Only show filter chips for types this brain actually contains
    const availableTypes = contentTypeOrder.filter((type) => state.content.some((item) => item.type === type));

    return (
        <SharedLayout>
            <div className="mb-6">
                <p className="text-sm text-gray-500">Shared with you</p>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    <span className="capitalize">{state.username}</span>'s Brain
                    <span className="ml-2 align-middle text-base font-medium text-gray-400">{state.content.length}</span>
                </h1>
            </div>

            {/* Filter chips */}
            {availableTypes.length > 1 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    {(["all", ...availableTypes] as ContentFilter[]).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFilter(type)}
                            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors [&_svg]:size-4
                                ${filter === type
                                    ? "border-purple-600 bg-purple-600 text-white"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"}`}
                        >
                            {type !== "all" && contentTypes[type].icon}
                            {type === "all" ? "All" : contentTypes[type].label}
                        </button>
                    ))}
                </div>
            )}

            {visible.length === 0 ? (
                <p className="mt-16 text-center text-gray-500">Nothing here yet.</p>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-6">
                    {visible.map((item, index) => (
                        <Card
                            key={item._id || index}
                            type={item.type}
                            link={item.link}
                            text={item.text}
                            description={item.description}
                            title={item.title}
                            readOnly
                        />
                    ))}
                </div>
            )}
        </SharedLayout>
    );
}
