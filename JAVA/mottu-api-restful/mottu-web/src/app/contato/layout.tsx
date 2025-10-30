// src/app/contato/layout.tsx
import React from "react";
import "leaflet/dist/leaflet.css";

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen text-white p-4 md:p-8 mb-16">
            <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 pb-16 rounded-lg shadow-xl">
                {children}
            </div>
        </main>
    );
}