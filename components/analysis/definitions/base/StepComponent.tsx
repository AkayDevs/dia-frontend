import React from 'react';
import { BaseStepComponentProps } from './index';

/**
 * Base Step Component
 * This component serves as a fallback when a specific analysis type doesn't provide its own step component
 */
const BaseStepComponent: React.FC<BaseStepComponentProps> = ({ analysisId, analysisType, step }) => {
    return (
        <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-lg font-medium mb-2">{step.name}</h2>
            <p className="text-sm text-gray-500">{step.description}</p>
            <p className="text-sm text-gray-500">
                No specific component found for step: {step.step_code} in analysis type: {analysisType}
            </p>
            <p className="text-sm text-gray-500">Analysis ID: {analysisId}</p>
        </div>
    );
};

export default BaseStepComponent; 