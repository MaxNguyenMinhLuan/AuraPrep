
import React from 'react';
import { FigureStimulus } from '../types';

interface GeometryFigureRendererProps {
    data: FigureStimulus;
}

/**
 * Schematic (not-to-scale) labeled figure — matches real SAT convention of
 * "figure not necessarily drawn to scale." Measurements are placed at their
 * logical position on the shape and also listed as a legend below for
 * accessibility, since the generator supplies labeled values, not exact
 * coordinates to render precisely to scale.
 */
const GeometryFigureRenderer: React.FC<GeometryFigureRendererProps> = ({ data }) => {
    const { shape, measurements } = data;
    const size = 220;
    const cx = size / 2;
    const cy = size / 2;

    const renderShape = () => {
        switch (shape) {
            case 'circle': {
                const r = 70;
                const radiusLabel = measurements.find(m => /radius|diameter/i.test(m.label));
                return (
                    <g>
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#374151" strokeWidth="2" />
                        <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#4338ca" strokeWidth="2" />
                        <circle cx={cx} cy={cy} r="2.5" fill="#374151" />
                        {radiusLabel && (
                            <text x={cx + r / 2} y={cy - 8} fontSize="12" textAnchor="middle" fill="#4338ca" fontWeight="bold">
                                {radiusLabel.value}
                            </text>
                        )}
                    </g>
                );
            }
            case 'triangle': {
                const pts: [number, number][] = [[cx, cy - 80], [cx - 80, cy + 60], [cx + 80, cy + 60]];
                const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
                const edgeMidpoints = [mid(pts[0], pts[1]), mid(pts[1], pts[2]), mid(pts[2], pts[0])];
                return (
                    <g>
                        <polygon points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="#374151" strokeWidth="2" />
                        {measurements.slice(0, 3).map((m, i) => (
                            <text
                                key={i}
                                x={edgeMidpoints[i][0]}
                                y={edgeMidpoints[i][1]}
                                fontSize="12"
                                textAnchor="middle"
                                fill="#4338ca"
                                fontWeight="bold"
                                dx={i === 0 ? -16 : i === 2 ? 16 : 0}
                                dy={i === 1 ? 18 : -4}
                            >
                                {m.value}
                            </text>
                        ))}
                    </g>
                );
            }
            case 'rectangle': {
                const w = 160;
                const h = 90;
                const x = cx - w / 2;
                const y = cy - h / 2;
                return (
                    <g>
                        <rect x={x} y={y} width={w} height={h} fill="none" stroke="#374151" strokeWidth="2" />
                        {measurements[0] && (
                            <text x={cx} y={y - 8} fontSize="12" textAnchor="middle" fill="#4338ca" fontWeight="bold">{measurements[0].value}</text>
                        )}
                        {measurements[1] && (
                            <text x={x + w + 14} y={cy} fontSize="12" textAnchor="start" fill="#4338ca" fontWeight="bold">{measurements[1].value}</text>
                        )}
                    </g>
                );
            }
            case 'polygon':
            default: {
                const n = Math.max(measurements.length, 3);
                const r = 80;
                const pts: [number, number][] = Array.from({ length: n }, (_, i) => {
                    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
                    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
                });
                return (
                    <g>
                        <polygon points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="#374151" strokeWidth="2" />
                        {measurements.map((m, i) => {
                            const p1 = pts[i];
                            const p2 = pts[(i + 1) % n];
                            const mx = (p1[0] + p2[0]) / 2;
                            const my = (p1[1] + p2[1]) / 2;
                            return (
                                <text key={i} x={mx} y={my} fontSize="11" textAnchor="middle" fill="#4338ca" fontWeight="bold">
                                    {m.value}
                                </text>
                            );
                        })}
                    </g>
                );
            }
        }
    };

    return (
        <div className="flex flex-col items-center my-4 bg-white p-3 border-2 border-secondary/30 rounded-lg shadow-sm max-w-full overflow-hidden">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="font-sans">
                {renderShape()}
            </svg>
            {measurements.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 justify-center text-[10px] text-text-dim">
                    {measurements.map((m, i) => (
                        <span key={i}><span className="font-bold text-text-main">{m.label}:</span> {m.value}</span>
                    ))}
                </div>
            )}
            <p className="text-[9px] text-text-dark/50 italic mt-1">Figure not necessarily drawn to scale.</p>
        </div>
    );
};

export default GeometryFigureRenderer;
