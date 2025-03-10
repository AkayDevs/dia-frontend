import React from 'react';
import { BaseOverviewProps } from '../base';

/**
 * Table Analysis Overview Component
 */
const TableOverview: React.FC<BaseOverviewProps> = ({ analysisId, analysisType }) => {
    return (
        <div className="p-4 border rounded-md">
            <h2 className="text-lg font-medium mb-2">Table Analysis Overview</h2>
            <div className="mt-4 space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-md font-medium mb-2">Analysis Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Analysis Type</p>
                            <p className="text-sm">Table Analysis</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <p className="text-sm">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Completed
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Created At</p>
                            <p className="text-sm">{new Date().toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Last Updated</p>
                            <p className="text-sm">{new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-md font-medium mb-2">Table Statistics</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Rows</p>
                            <p className="text-sm">24</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Columns</p>
                            <p className="text-sm">8</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Confidence</p>
                            <p className="text-sm">92%</p>
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Analysis ID: {analysisId}</p>
        </div>
    );
};

export default TableOverview; 