
import React from 'react';
import { GraphData, Point } from '../types';

interface QuestionGraphProps {
    data: GraphData;
}

const QuestionGraph: React.FC<QuestionGraphProps> = ({ data }) => {
    const padding = 40;
    const width = 300;
    const height = 300;

    // Default bounds, adjusted to include all points
    let xMin = -10, xMax = 10, yMin = -10, yMax = 10;
    
    if (data.points.length > 0) {
        data.points.forEach(p => {
            xMin = Math.min(xMin, p.x - 2);
            xMax = Math.max(xMax, p.x + 2);
            yMin = Math.min(yMin, p.y - 2);
            yMax = Math.max(yMax, p.y + 2);
        });
    }

    // Keep aspect ratio 1:1 and ensure 0 is somewhat centered if possible
    const rangeX = xMax - xMin;
    const rangeY = yMax - yMin;
    const maxRange = Math.max(rangeX, rangeY);
    
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    
    xMin = centerX - maxRange / 2;
    xMax = centerX + maxRange / 2;
    yMin = centerY - maxRange / 2;
    yMax = centerY + maxRange / 2;

    const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
    const toSvgY = (y: number) => (height - padding) - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);

    const zeroX = toSvgX(0);
    const zeroY = toSvgY(0);

    // Grid lines
    const gridSteps = 10;
    const xStep = (xMax - xMin) / gridSteps;
    const yStep = (yMax - yMin) / gridSteps;

    return (
        <div className="flex justify-center my-4 bg-white p-2 border-2 border-secondary/30 rounded-lg shadow-sm max-w-full overflow-hidden">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="font-sans">
                {/* Grid Lines */}
                {Array.from({ length: gridSteps + 1 }).map((_, i) => {
                    const x = xMin + i * xStep;
                    const y = yMin + i * yStep;
                    return (
                        <React.Fragment key={i}>
                            <line x1={toSvgX(x)} y1={padding} x2={toSvgX(x)} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
                            <line x1={padding} y1={toSvgY(y)} x2={width - padding} y2={toSvgY(y)} stroke="#e5e7eb" strokeWidth="1" />
                            {/* Labels for primary axis */}
                            {Math.abs(x) > 0.1 && (
                                <text x={toSvgX(x)} y={zeroY + 12} fontSize="8" textAnchor="middle" fill="#9ca3af">{Math.round(x)}</text>
                            )}
                            {Math.abs(y) > 0.1 && (
                                <text x={zeroX - 12} y={toSvgY(y) + 3} fontSize="8" textAnchor="end" fill="#9ca3af">{Math.round(y)}</text>
                            )}
                        </React.Fragment>
                    );
                })}

                {/* Axes */}
                <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY} stroke="#374151" strokeWidth="2" />
                <line x1={zeroX} y1={padding} x2={zeroX} y2={height - padding} stroke="#374151" strokeWidth="2" />
                
                {/* Axis Labels */}
                <text x={width - padding + 5} y={zeroY + 3} fontSize="10" fontWeight="bold" fill="#374151">x</text>
                <text x={zeroX} y={padding - 10} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#374151">y</text>

                {/* Data: Lines */}
                {(data.type === 'line' || data.type === 'system') && data.points.length >= 2 && (
                    <line 
                        x1={toSvgX(data.points[0].x)} 
                        y1={toSvgY(data.points[0].y)} 
                        x2={toSvgX(data.points[1].x)} 
                        y2={toSvgY(data.points[1].y)} 
                        stroke="#4338ca" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                    />
                )}

                {/* Data: Points */}
                {data.points.map((p, i) => (
                    <circle key={i} cx={toSvgX(p.x)} cy={toSvgY(p.y)} r="4" fill="#ca8a04" stroke="white" strokeWidth="1" />
                ))}
            </svg>
        </div>
    );
};

export default QuestionGraph;
