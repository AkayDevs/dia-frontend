import React from 'react';
import { BaseEditsProps } from './index';

/**
 * Base Edits Component
 * This component serves as a fallback when a specific analysis type doesn't provide its own Edits component
 */
const BaseEdits: React.FC<BaseEditsProps> = ({ analysisId, analysisType, stepCode }) => {
    return (
        <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-lg font-medium mb-2">Analysis Edits</h2>
            <p className="text-sm text-gray-500">
                No specific edits component found for analysis type: {analysisType}, step: {stepCode}
            </p>
            <p className="text-sm text-gray-500">Analysis ID: {analysisId}</p>
        </div>
    );
};

export default BaseEdits; 