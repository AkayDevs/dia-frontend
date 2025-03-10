import React from 'react';
import { BaseStepComponentProps } from '../base';

/**
 * Table Analysis Extract Step Component
 * This is a step-specific component for the extraction step in table analysis
 */
const TableExtractStep: React.FC<BaseStepComponentProps> = ({ analysisId, analysisType, step }) => {
    return (
        <div className="p-4 border rounded-md">
            <h2 className="text-lg font-medium mb-2">{step.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{step.description}</p>

            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-md font-medium mb-2">Extraction Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Table Detection Method</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                defaultValue="auto"
                            >
                                <option value="auto">Automatic</option>
                                <option value="bordered">Bordered Tables</option>
                                <option value="borderless">Borderless Tables</option>
                                <option value="structured">Structured Data</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confidence Threshold</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                defaultValue="75"
                                className="mt-1 block w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Low</span>
                                <span>Medium</span>
                                <span>High</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Extract Tables
                    </button>
                </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">Step Code: {step.step_code} | Analysis ID: {analysisId}</p>
        </div>
    );
};

export default TableExtractStep; 