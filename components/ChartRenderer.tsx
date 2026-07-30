
import React from 'react';
import { ChartStimulus } from '../types';
import QuestionGraph from './QuestionGraph';

interface ChartRendererProps {
    data: ChartStimulus;
}

/**
 * Renders v2's structured ChartStimulus. Bar charts are new (nothing in
 * the app drew them before); line/scatter/system reuse QuestionGraph's
 * existing coordinate-plane math instead of duplicating it — the only
 * difference from v1 is the points come from generator-authored structured
 * data instead of a regex scraping "(x, y)" pairs out of question text.
 */
const ChartRenderer: React.FC<ChartRendererProps> = ({ data }) => {
    if (data.chartType === 'bar') {
        return <BarChart data={data} />;
    }

    return (
        <div>
            <QuestionGraph data={{ type: data.chartType, points: data.points || [], labels: data.labels }} />
            {data.legend && data.legend.length > 0 && (
                <div className="flex justify-center gap-3 -mt-2 mb-2 flex-wrap">
                    {data.legend.map((l, i) => (
                        <span key={i} className="text-[10px] text-text-dim">{l}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

const BarChart: React.FC<{ data: ChartStimulus }> = ({ data }) => {
    const bars = data.bars || [];
    const padding = 45;
    const width = 320;
    const height = 260;

    if (bars.length === 0) return null;

    const maxVal = Math.max(...bars.map(b => b.value), 1);
    const barAreaWidth = width - 1.5 * padding;
    const gap = barAreaWidth / bars.length;
    const barWidth = gap * 0.6;

    return (
        <div className="flex flex-col items-center my-4 bg-white p-3 border-2 border-secondary/30 rounded-lg shadow-sm max-w-full overflow-hidden">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="font-sans">
                <line x1={padding} y1={height - padding} x2={width - padding / 2} y2={height - padding} stroke="#374151" strokeWidth="2" />
                <line x1={padding} y1={padding / 2} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2" />
                {bars.map((bar, i) => {
                    const barHeight = ((height - 1.5 * padding) * bar.value) / maxVal;
                    const x = padding + i * gap + (gap - barWidth) / 2;
                    const y = height - padding - barHeight;
                    return (
                        <g key={i}>
                            <rect x={x} y={y} width={barWidth} height={barHeight} fill="#4338ca" opacity="0.85" rx="2" />
                            <text x={x + barWidth / 2} y={y - 6} fontSize="10" textAnchor="middle" fill="#374151">{bar.value}</text>
                            <text x={x + barWidth / 2} y={height - padding + 16} fontSize="9" textAnchor="middle" fill="#6b7280">{bar.label}</text>
                        </g>
                    );
                })}
                {data.labels?.y && (
                    <text x={12} y={height / 2} fontSize="10" fill="#374151" fontWeight="bold" textAnchor="middle" transform={`rotate(-90, 12, ${height / 2})`}>
                        {data.labels.y}
                    </text>
                )}
                {data.labels?.x && (
                    <text x={width / 2} y={height - 4} fontSize="10" fill="#374151" fontWeight="bold" textAnchor="middle">{data.labels.x}</text>
                )}
            </svg>
        </div>
    );
};

export default ChartRenderer;
