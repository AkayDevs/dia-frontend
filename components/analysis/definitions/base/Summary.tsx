import React from 'react';
import { BaseSummaryProps } from './index';

/**
 * Base Summary Component
 * This component serves as a fallback when a specific analysis type doesn't provide its own Summary component
 */
const BaseSummary: React.FC<BaseSummaryProps> = ({
    analysisId,
    analysisType,
    stepCode,
    documentId,
    status,
    createdAt,
    completedAt,
    metadata,
    stepResults,
    allStepResults
}) => {
    return (
        <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-lg font-medium mb-2">Analysis Summary</h2>
            <p className="text-sm text-gray-500">
                No specific summary component found for analysis type: {analysisType}, step: {stepCode}
            </p>

            <div className="mt-4 space-y-2">
                <p className="text-sm"><span className="font-medium">Analysis ID:</span> {analysisId}</p>
                <p className="text-sm"><span className="font-medium">Analysis Type:</span> {analysisType}</p>
                <p className="text-sm"><span className="font-medium">Step Code:</span> {stepCode}</p>

                {documentId && (
                    <p className="text-sm"><span className="font-medium">Document ID:</span> {documentId}</p>
                )}

                {status && (
                    <p className="text-sm"><span className="font-medium">Status:</span> {status}</p>
                )}

                {createdAt && (
                    <p className="text-sm">
                        <span className="font-medium">Created At:</span> {new Date(createdAt).toLocaleString()}
                    </p>
                )}

                {completedAt && (
                    <p className="text-sm">
                        <span className="font-medium">Completed At:</span> {new Date(completedAt).toLocaleString()}
                    </p>
                )}
            </div>

            {metadata && Object.keys(metadata).length > 0 && (
                <div className="mt-4">
                    <h3 className="text-md font-medium mb-1">Metadata</h3>
                    <div className="bg-white p-2 rounded border">
                        <pre className="text-xs overflow-auto">
                            {JSON.stringify(metadata, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {stepResults && Object.keys(stepResults).length > 0 && (
                <div className="mt-4">
                    <h3 className="text-md font-medium mb-1">Step Results</h3>
                    <div className="bg-white p-2 rounded border">
                        <pre className="text-xs overflow-auto">
                            {JSON.stringify(stepResults, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {allStepResults && Object.keys(allStepResults).length > 0 && (
                <div className="mt-4">
                    <h3 className="text-md font-medium mb-1">All Step Results</h3>
                    <div className="bg-white p-2 rounded border">
                        <pre className="text-xs overflow-auto">
                            {JSON.stringify(allStepResults, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BaseSummary; 