"use client";

// src/ParticleBackground.jsx
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const PARTICLE_COLOR = { r: 156, g: 217, b: 249 }; // cor dos pontos/linhas (igual ao original)
const LINKS_PER_POINT = 5;                           // número de vizinhos
const GRID_DIVISIONS = 20;                           // densidade (quanto maior, menos pontos)

export default function ParticleBackground() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const pointsRef = useRef([]);
  const targetRef = useRef({ x: 0, y: 0 });
  const animatingRef = useRef(true);
  const rafRef = useRef(0);

  // ---------- utils ----------
  const dist2 = (p1, p2) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  };

  const drawLines = (p) => {
    if (!p.active) return;
    const ctx = ctxRef.current;
    for (let i = 0; i < p.closest.length; i++) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.closest[i].x, p.closest[i].y);
      ctx.strokeStyle = `rgba(${PARTICLE_COLOR.r},${PARTICLE_COLOR.g},${PARTICLE_COLOR.b},${p.active})`;
      ctx.stroke();
    }
  };

  const drawCircle = (p) => {
    if (!p.circle.active) return;
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.circle.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = `rgba(${PARTICLE_COLOR.r},${PARTICLE_COLOR.g},${PARTICLE_COLOR.b},${p.circle.active})`;
    ctx.fill();
  };

  const shiftPoint = (p) => {
    gsap.to(p, {
      duration: 1 + Math.random(),
      x: p.originX - 50 + Math.random() * 100,
      y: p.originY - 50 + Math.random() * 100,
      ease: "circ.inOut",
      onComplete: () => shiftPoint(p),
    });
  };

  const buildPoints = (width, height) => {
    // cria grid "solto"
    const pts = [];
    const stepX = width / GRID_DIVISIONS;
    const stepY = height / GRID_DIVISIONS;

    for (let x = 0; x < width; x += stepX) {
      for (let y = 0; y < height; y += stepY) {
        const px = x + Math.random() * stepX;
        const py = y + Math.random() * stepY;
        pts.push({
          x: px,
          y: py,
          originX: px,
          originY: py,
          active: 0,
          circle: { radius: 2 + Math.random() * 2, active: 0 },
          closest: [],
        });
      }
    }

    // encontra vizinhos mais próximos
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const closest = new Array(LINKS_PER_POINT).fill(undefined);

      for (let j = 0; j < pts.length; j++) {
        if (i === j) continue;
        const p2 = pts[j];

        // tente posicionar p2 em "closest" se estiver mais perto que algum existente
        for (let k = 0; k < LINKS_PER_POINT; k++) {
          if (
            closest[k] === undefined ||
            dist2(p1, p2) < dist2(p1, closest[k])
          ) {
            // insere mantendo os melhores
            closest.splice(k, 0, p2);
            closest.length = LINKS_PER_POINT;
            break;
          }
        }
      }

      p1.closest = closest;
    }

    pointsRef.current = pts;
    pts.forEach(shiftPoint);
  };

  const sizeCanvas = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    container.style.height = `${height}px`;
    canvas.width = width;
    canvas.height = height;

    return { width, height };
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const points = pointsRef.current;
    const target = targetRef.current;

    if (!canvas || !ctx) return;

    if (animatingRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const d2 = Math.abs(dist2(target, p));

        if (d2 < 4000) {
          p.active = 0.3;
          p.circle.active = 0.6;
        } else if (d2 < 20000) {
          p.active = 0.1;
          p.circle.active = 0.3;
        } else if (d2 < 40000) {
          p.active = 0.02;
          p.circle.active = 0.1;
        } else {
          p.active = 0;
          p.circle.active = 0;
        }

        drawLines(p);
        drawCircle(p);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  };

  // ---------- lifecycle ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    ctxRef.current = canvas.getContext("2d");

    // primeira posição do alvo = centro da tela
    targetRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    const { width, height } = sizeCanvas();
    buildPoints(width, height);
    animate();

    // listeners
    const onMouseMove = (e) => {
      const x = e.pageX ?? e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      const y = e.pageY ?? e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      targetRef.current.x = x;
      targetRef.current.y = y;
    };

    const onScroll = () => {
      animatingRef.current = window.scrollY <= window.innerHeight;
    };

    const onResize = () => {
      // ao redimensionar, refaça tudo (e mate tweens pra não vazar)
      gsap.killTweensOf(pointsRef.current);
      const { width, height } = sizeCanvas();
      buildPoints(width, height);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
      gsap.killTweensOf(pointsRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="large-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#000000',
        overflow: 'hidden',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        zIndex: 0
      }}
    >
      <canvas 
        ref={canvasRef} 
        id="demo-canvas"
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
}

