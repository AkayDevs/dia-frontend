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
    analysisRun
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

                {analysisRun.document_id && (
                    <p className="text-sm"><span className="font-medium">Document ID:</span> {analysisRun.document_id}</p>
                )}

                {analysisRun.status && (
                    <p className="text-sm"><span className="font-medium">Status:</span> {analysisRun.status}</p>
                )}

                {analysisRun.created_at && (
                    <p className="text-sm">
                        <span className="font-medium">Created At:</span> {new Date(analysisRun.created_at).toLocaleString()}
                    </p>
                )}

                {analysisRun.completed_at && (
                    <p className="text-sm">
                        <span className="font-medium">Completed At:</span> {new Date(analysisRun.completed_at).toLocaleString()}
                    </p>
                )}
            </div>

            {analysisRun.step_results && analysisRun.step_results.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-md font-medium mb-1">Step Results</h3>
                    <div className="bg-white p-2 rounded border">
                        <pre className="text-xs overflow-auto">
                            {JSON.stringify(analysisRun.step_results, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

        </div>
    );
};

export default BaseSummary; 