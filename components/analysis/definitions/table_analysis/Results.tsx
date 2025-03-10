import React from 'react';
import { BaseResultsProps } from '../base';

/**
 * Table Analysis Results Component
 */
const TableResults: React.FC<BaseResultsProps> = ({ analysisId, analysisType, stepCode }) => {
    return (
        <div className="p-4 border rounded-md">
            <h2 className="text-lg font-medium mb-2">Table Analysis Results</h2>
            <p className="text-sm">
                Showing results for table analysis step: {stepCode}
            </p>
            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sample Column 1</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sample Value 1</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">95%</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sample Column 2</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sample Value 2</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">87%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">Analysis ID: {analysisId}</p>
        </div>
    );
};

export default TableResults; 