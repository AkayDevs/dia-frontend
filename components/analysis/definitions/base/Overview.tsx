import React from 'react';
import { BaseOverviewProps } from './index';

/**
 * Base Overview Component
 * This component serves as a fallback when a specific analysis type doesn't provide its own Overview component
 */
const BaseOverview: React.FC<BaseOverviewProps> = ({ analysisId, analysisType }) => {
    return (
        <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-lg font-medium mb-2">Analysis Overview</h2>
            <p className="text-sm text-gray-500">
                No specific overview component found for analysis type: {analysisType}
            </p>
            <p className="text-sm text-gray-500">Analysis ID: {analysisId}</p>
        </div>
    );
};

export default BaseOverview; 