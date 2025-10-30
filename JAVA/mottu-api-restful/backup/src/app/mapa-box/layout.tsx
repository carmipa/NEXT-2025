import React from "react";
import "leaflet/dist/leaflet.css";

export default function MapaBoxLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen">
            {children}
        </main>
    );
}
