"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
    /** Caminho para a imagem do efeito (em /public) */
    imageSrc?: string;
    /** Classe extra no wrapper do card */
    className?: string;
    /** Conteúdo interno do card (título, subtítulo, texto e botões) */
    children: React.ReactNode;
};

/**
 * Card com efeito 3D/tilt. Usa as classes globais (.pcar, .pcar-card, .pcar-bike, .pcar-circle, .pcar-info).
 * Para “saltar” elementos específicos, adicione no seu conteúdo:
 *  - h1.pcar-title
 *  - .pcar-text   (ex.: div que envolve o parágrafo)
 *  - .pcar-actions (ex.: div que envolve os botões)
 */
export default function PcarTiltCard({
                                         imageSrc = "/fotos-equipe/fundo_pcar.png",
                                         className = "",
                                         children,
                                     }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const cardRef = useRef<HTMLElement | null>(null);
    const infoRef = useRef<HTMLDivElement | null>(null);
    const bikeImgRef = useRef<HTMLImageElement | null>(null);

    const [transform, setTransform] = useState<string>("rotateY(0deg) rotateX(0deg)");

    useEffect(() => {
        const container = containerRef.current;
        const card = cardRef.current;
        if (!container || !card) return;

        let rafId: number | null = null;

        const onMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const xAxis = (innerWidth / 2 - e.clientX) / 25;
            const yAxis = (innerHeight / 2 - e.clientY) / 25;

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                setTransform(`rotateY(${xAxis}deg) rotateX(${yAxis}deg)`);
            });
        };

        const addPopClasses = () => {
            card.classList.add("has-transform");
            bikeImgRef.current?.classList.add("has-transform");
            infoRef.current?.classList.add("has-transform");

            // Se você marcou seus elementos, eles também “saltam”
            infoRef.current?.querySelector<HTMLElement>(".pcar-title")?.classList.add("has-transform");
            infoRef.current?.querySelector<HTMLElement>(".pcar-text")?.classList.add("has-transform");
            infoRef.current?.querySelector<HTMLElement>(".pcar-actions")?.classList.add("has-transform");
        };

        const removePopClasses = () => {
            setTransform("rotateY(0deg) rotateX(0deg)");
            card.classList.remove("has-transform");
            bikeImgRef.current?.classList.remove("has-transform");
            infoRef.current?.classList.remove("has-transform");

            infoRef.current?.querySelector<HTMLElement>(".pcar-title")?.classList.remove("has-transform");
            infoRef.current?.querySelector<HTMLElement>(".pcar-text")?.classList.remove("has-transform");
            infoRef.current?.querySelector<HTMLElement>(".pcar-actions")?.classList.remove("has-transform");
        };

        const onEnter = () => addPopClasses();
        const onLeave = () => removePopClasses();

        container.addEventListener("mousemove", onMove);
        container.addEventListener("mouseenter", onEnter);
        container.addEventListener("mouseleave", onLeave);

        return () => {
            container.removeEventListener("mousemove", onMove);
            container.removeEventListener("mouseenter", onEnter);
            container.removeEventListener("mouseleave", onLeave);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div className="pcar" ref={containerRef}>
            <section
                className={`pcar-card ${className}`}
                ref={cardRef}
                style={{ transform }}
                aria-live="polite"
            >
                {/* Bloco da imagem/gradiente */}
                <div className="pcar-bike">
                    <img
                        ref={bikeImgRef}
                        src={imageSrc}
                        alt="Destaque do produto/veículo"
                        draggable={false}
                    />
                </div>

                {/* Conteúdo que você envia via children */}
                <div className="pcar-info" ref={infoRef}>
                    {children}
                </div>
            </section>
        </div>
    );
}
