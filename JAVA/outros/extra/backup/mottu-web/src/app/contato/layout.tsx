// src/app/contato/layout.tsx
import React from "react";
import "leaflet/dist/leaflet.css";
import NavBar from "@/components/nav-bar";

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <NavBar active="contato" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    {children}
                </div>
            </main>
        </>
    );
}