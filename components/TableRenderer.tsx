
import React from 'react';
import { TableStimulus } from '../types';

interface TableRendererProps {
    data: TableStimulus;
}

const TableRenderer: React.FC<TableRendererProps> = ({ data }) => {
    return (
        <div className="my-4 overflow-x-auto rounded-lg border-2 border-secondary/30 bg-white">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-secondary/20">
                        {data.headers.map((h, i) => (
                            <th key={i} className="px-3 py-2 text-left font-bold text-gray-800 border-b-2 border-secondary/30 whitespace-nowrap">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.rows.map((row, ri) => (
                        <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-2 text-gray-700 border-b border-secondary/10 whitespace-nowrap">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.caption && (
                <p className="px-3 py-2 text-xs text-text-dim italic border-t border-secondary/20">{data.caption}</p>
            )}
        </div>
    );
};

export default TableRenderer;
