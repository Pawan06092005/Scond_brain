import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { SharedLayout, SharedNotFound } from "../components/SharedLayout";
import type { ContentItem } from "../contentTypes";

type State =
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; username: string; item: ContentItem };

// Public, read-only view of one shared item: /share/item/:hash
export default function SharedItem() {
    const { hash } = useParams();
    const [state, setState] = useState<State>({ status: "loading" });

    useEffect(() => {
        fetch(`/api/v1/shared/item/${hash}`)
            .then((response) => (response.ok ? response.json() : Promise.reject()))
            .then((data) => setState({ status: "ready", username: data.username, item: data.item }))
            .catch(() => setState({ status: "error" }));
    }, [hash]);

    return (
        <SharedLayout>
            {state.status === "loading" && (
                <div className="mx-auto h-[28rem] max-w-2xl animate-pulse rounded-2xl bg-gray-200/70" />
            )}

            {state.status === "error" && <SharedNotFound />}

            {state.status === "ready" && (
                <div className="mx-auto max-w-2xl">
                    <p className="mb-3 text-sm text-gray-500">
                        Shared by <span className="font-medium capitalize text-gray-700">{state.username}</span>
                    </p>
                    <Card
                        type={state.item.type}
                        link={state.item.link}
                        text={state.item.text}
                        description={state.item.description}
                        title={state.item.title}
                        readOnly
                        expanded
                    />
                </div>
            )}
        </SharedLayout>
    );
}
