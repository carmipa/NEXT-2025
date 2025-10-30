// Simples: recebe marcadores já com posição calculada (cx, cy) no mesmo sistema do SVG.
// Passe também k para escalar texto/traço conforme zoom.
type Marker = { id: string | number; label: string; cx: number; cy: number };

export default function UsuarioMarkers({
                                           itens,
                                           k = 1,
                                       }: { itens: Marker[]; k?: number }) {
    return (
        <g pointerEvents="none">
            {itens.map((m) => (
                <g key={m.id} transform={`translate(${m.cx},${m.cy})`}>
                    <circle r={1.2 / k} fill="#2563eb" stroke="white" strokeWidth={0.35 / k} />
                    <text
                        x={2 / k}
                        y={1 / k}
                        fontSize={2.6 / k}
                        fill="#111827"
                        stroke="white"
                        strokeWidth={0.35 / k}
                    >
                        {m.label}
                    </text>
                </g>
            ))}
        </g>
    );
}
