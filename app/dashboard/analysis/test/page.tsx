'use client';

import React, { useState } from 'react';
import { AnalysisDefinitionCode } from '../../../../constants/analysis/registry';
import { getAnalysisSteps } from '../../../../constants/analysis/registry';
import AnalysisResultsExample from '../../../../components/analysis/examples/AnalysisResultsExample';

/**
 * Test Analysis Page
 * This page demonstrates the analysis components registry
 */
const TestAnalysisPage = () => {
    // Sample analysis data
    const [analysisId, setAnalysisId] = useState('test-123');
    const [analysisType, setAnalysisType] = useState<string>(AnalysisDefinitionCode.TABLE_ANALYSIS);
    const [stepCode, setStepCode] = useState<string>('extract');

    // Get available steps for the selected analysis type
    const steps = getAnalysisSteps(analysisType);

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h1 className="text-2xl font-bold mb-6">Analysis Components Test</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Analysis ID Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Analysis ID
                        </label>
                        <input
                            type="text"
                            value={analysisId}
                            onChange={(e) => setAnalysisId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Analysis Type Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Analysis Type
                        </label>
                        <select
                            value={analysisType}
                            onChange={(e) => {
                                setAnalysisType(e.target.value);
                                // Reset step code when analysis type changes
                                const newSteps = getAnalysisSteps(e.target.value);
                                if (newSteps.length > 0) {
                                    setStepCode(newSteps[0].step_code);
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {Object.values(AnalysisDefinitionCode).map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Step Code Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Step Code
                        </label>
                        <select
                            value={stepCode}
                            onChange={(e) => setStepCode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {steps.map((step) => (
                                <option key={step.step_code} value={step.step_code}>
                                    {step.name} ({step.step_code})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            // Refresh the component by forcing a re-render
                            setAnalysisId(analysisId + '-' + Date.now());
                            setTimeout(() => setAnalysisId('test-123'), 100);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Refresh Components
                    </button>
                </div>
            </div>

            {/* Render the example component with the selected parameters */}
            <AnalysisResultsExample
                analysisId={analysisId}
                analysisType={analysisType}
                stepCode={stepCode}
            />
        </div>
    );
};

export default TestAnalysisPage; 