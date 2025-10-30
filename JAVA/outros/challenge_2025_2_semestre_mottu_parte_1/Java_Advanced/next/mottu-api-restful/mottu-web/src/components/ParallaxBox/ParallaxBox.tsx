"use client";

import React, { useRef, useEffect, ReactNode } from 'react';

// Função de interpolação linear (suaviza o movimento)
function lerp(start: number, end: number, amount: number): number {
    return (1 - amount) * start + amount * end;
}

// Tipagem para as propriedades do componente
interface ParallaxBoxProps {
    children: ReactNode;
    maxRotation?: number; // Rotação máxima em graus
    smoothness?: number;  // Quão suave será o movimento (0 a 1)
}

export default function ParallaxBox({
                                        children,
                                        maxRotation = 6, // Rotação sutil por padrão
                                        smoothness = 0.08 // Um bom valor para suavidade
                                    }: ParallaxBoxProps) {
    const boxRef = useRef<HTMLDivElement>(null);

    // Refs para armazenar a posição do mouse e a animação
    const mousePos = useRef({ x: 0, y: 0 });
    const targetPos = useRef({ x: 0, y: 0 });
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (!boxRef.current) return;

            const { clientX, clientY } = event;
            const { innerWidth, innerHeight } = window;

            // Calcula a posição do mouse como um valor de -0.5 a 0.5
            const x = (clientX / innerWidth) - 0.5;
            const y = (clientY / innerHeight) - 0.5;

            targetPos.current = { x, y };
        };

        const animate = () => {
            if (boxRef.current) {
                // Suaviza a transição da posição atual para a posição alvo
                mousePos.current.x = lerp(mousePos.current.x, targetPos.current.x, smoothness);
                mousePos.current.y = lerp(mousePos.current.y, targetPos.current.y, smoothness);

                // Calcula a rotação com base na posição suavizada do mouse
                // Invertemos 'y' para que o eixo X rotacione corretamente
                const rotateY = mousePos.current.x * maxRotation;
                const rotateX = -mousePos.current.y * maxRotation;

                // Aplica a transformação 3D ao elemento
                boxRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
            animationFrameId.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animationFrameId.current = requestAnimationFrame(animate);

        // Função de limpeza: remove o listener e cancela a animação
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [maxRotation, smoothness]); // Efeito é re-executado se as props mudarem

    return (
        <div
            ref={boxRef}
            style={{
                transformStyle: 'preserve-3d',
                willChange: 'transform',
                transition: 'transform 0.1s linear' // Adiciona uma pequena transição para "parar" suavemente
            }}
        >
            {children}
        </div>
    );
}