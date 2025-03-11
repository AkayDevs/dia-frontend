import React from 'react';
import { BaseResultsProps } from './index';

/**
 * Base Results Component
 * This component serves as a fallback when a specific analysis type doesn't provide its own Results component
 */
const BaseResults: React.FC<BaseResultsProps> = ({
  analysisId,
  analysisType,
  stepCode,
  stepResult,
  documentId,
  pageNumber,
  showControls,
  onExport
}) => {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="text-lg font-medium mb-2">Analysis Results</h2>
      <p className="text-sm text-gray-500">
        No specific results component found for analysis type: {analysisType}, step: {stepCode}
      </p>

      <div className="mt-4 space-y-2">
        <p className="text-sm"><span className="font-medium">Analysis ID:</span> {analysisId}</p>
        <p className="text-sm"><span className="font-medium">Analysis Type:</span> {analysisType}</p>
        <p className="text-sm"><span className="font-medium">Step Code:</span> {stepCode}</p>

        {documentId && (
          <p className="text-sm"><span className="font-medium">Document ID:</span> {documentId}</p>
        )}

        {pageNumber !== undefined && (
          <p className="text-sm"><span className="font-medium">Page Number:</span> {pageNumber}</p>
        )}
      </div>

      {stepResult && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-1">Step Result</h3>
          <div className="bg-white p-2 rounded border">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(stepResult, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {showControls && onExport && (
        <div className="mt-4">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            onClick={() => onExport('json')}
          >
            Export as JSON
          </button>
        </div>
      )}
    </div>
  );
};

export default BaseResults;
