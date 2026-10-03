import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrainIcon } from "../icons/BrainIcon";

// Page frame for public share links: simple top bar + "make your own" call to action
export function SharedLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-md shadow-purple-600/30">
                            <BrainIcon />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">Brainly</span>
                    </Link>
                    <Link
                        to="/signup"
                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-purple-600/20 transition hover:bg-purple-700"
                    >
                        Create your own brain
                    </Link>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">{children}</main>
        </div>
    );
}

// Shown when a share link is wrong or sharing was stopped
export function SharedNotFound() {
    return (
        <div className="mx-auto mt-16 max-w-sm rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">🔒</div>
            <h1 className="font-semibold text-gray-900">This link is no longer active</h1>
            <p className="mt-1 text-sm text-gray-500">The owner may have stopped sharing it, or the link is incorrect.</p>
        </div>
    );
}

// Grey placeholder blocks while content loads
export function SharedLoading({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="h-[24rem] animate-pulse rounded-2xl bg-gray-200/70" />
            ))}
        </div>
    );
}
