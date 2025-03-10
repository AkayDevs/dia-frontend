import React from 'react';
import { BaseResultsProps } from './index';

/**
 * Base Results Component
 * This component serves as a fallback when a specific analysis type doesn't provide its own Results component
 */
const BaseResults: React.FC<BaseResultsProps> = ({ analysisId, analysisType, stepCode }) => {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="text-lg font-medium mb-2">Analysis Results</h2>
      <p className="text-sm text-gray-500">
        No specific results component found for analysis type: {analysisType}, step: {stepCode}
      </p>
        <p className="text-sm text-gray-500">Analysis ID: {analysisId}</p>
    </div>
  );
};

export default BaseResults;
