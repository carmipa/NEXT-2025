// src/components/CrudScaffold.tsx
"use client";

import { ReactNode } from "react";

export default function CrudScaffold({
                                         title,
                                         actions,
                                         children,
                                     }: {
    title: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="py-8 md:py-10">
            <div className="container-page card">
                <div className="card-inner">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
                        {actions && <div className="flex gap-2">{actions}</div>}
                    </div>
                    <div>{children}</div>
                </div>
            </div>
        </section>
    );
}
