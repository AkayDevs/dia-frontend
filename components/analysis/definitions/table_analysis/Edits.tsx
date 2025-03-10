import React from 'react';
import { BaseEditsProps } from '../base';

/**
 * Table Analysis Edits Component
 */
const TableEdits: React.FC<BaseEditsProps> = ({ analysisId, analysisType, stepCode }) => {
    return (
        <div className="p-4 border rounded-md">
            <h2 className="text-lg font-medium mb-2">Table Analysis Edits</h2>
            <p className="text-sm">
                Edit table analysis results for step: {stepCode}
            </p>
            <div className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Column</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            defaultValue="Sample Column 1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Value</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            defaultValue="Sample Value 1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confidence</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            defaultValue="95%"
                            disabled
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Analysis ID: {analysisId}</p>
        </div>
    );
};

export default TableEdits; 