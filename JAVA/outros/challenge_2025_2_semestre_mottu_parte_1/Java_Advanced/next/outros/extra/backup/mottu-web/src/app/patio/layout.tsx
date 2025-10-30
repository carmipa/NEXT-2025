// src/app/patio/layout.tsx
'use client';
import React from 'react';

export default function PatioLayout({ children }: { children: React.ReactNode; }) {
    return <section>{children}</section>;
}