import React, { useState, useEffect } from 'react';
import { BaseSummaryProps } from '../base';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    BarChart,
    CheckCircle,
    AlertTriangle,
    Info,
    FileSpreadsheet,
    FileText,
    Clock
} from 'lucide-react';

/**
 * Enhanced Table Analysis Summary Component
 * Provides a comprehensive summary of table analysis results
 */
const TableSummary: React.FC<BaseSummaryProps> = ({
    analysisId,
    analysisType,
    stepCode,
    stepResults,
    allStepResults,
    documentId,
    status: analysisStatus,
    createdAt,
    completedAt,
    metadata
}) => {
    // In a real application, you would use the provided parameters instead of mock data
    // This is mock data for demonstration purposes, but would be replaced with real data
    const [summaryData, setSummaryData] = useState({
        status: analysisStatus || 'completed',
        completedAt: completedAt || new Date().toISOString(),
        createdAt: createdAt || new Date(Date.now() - 105000).toISOString(), // 1m 45s ago
        duration: '1m 45s',
        confidence: 92,
        tableStats: {
            rowCount: 24,
            columnCount: 8,
            cellCount: 192,
            headerRowDetected: true,
            footerRowDetected: false
        },
        qualityMetrics: {
            structureAccuracy: 98,
            contentAccuracy: 92,
            headerAccuracy: 95,
            lowConfidenceCells: 7
        },
        columnConfidence: [
            { name: 'Invoice Number', confidence: 98 },
            { name: 'Date', confidence: 96 },
            { name: 'Customer ID', confidence: 94 },
            { name: 'Description', confidence: 87 },
            { name: 'Quantity', confidence: 95 },
            { name: 'Unit Price', confidence: 93 },
            { name: 'Tax', confidence: 89 },
            { name: 'Total', confidence: 92 }
        ],
        issues: [
            { type: 'warning', message: 'Low confidence in 7 cells', affectedColumns: ['Description', 'Tax'] },
            { type: 'info', message: 'Merged cells detected and resolved', affectedColumns: ['Description'] }
        ],
        recommendations: [
            'Review the Description column values for accuracy',
            'Verify tax calculations in the Tax column',
            'Check for any missing rows at the bottom of the table'
        ]
    });

    // Calculate duration if both timestamps are available
    useEffect(() => {
        if (createdAt && completedAt) {
            const start = new Date(createdAt).getTime();
            const end = new Date(completedAt).getTime();
            const durationMs = end - start;

            // Format duration
            const minutes = Math.floor(durationMs / 60000);
            const seconds = Math.floor((durationMs % 60000) / 1000);
            const formattedDuration = `${minutes}m ${seconds}s`;

            setSummaryData(prev => ({
                ...prev,
                duration: formattedDuration
            }));
        }
    }, [createdAt, completedAt]);

    // Use step results if available
    useEffect(() => {
        if (stepResults) {
            // In a real application, you would process the step results here
            // and update the summary data accordingly
            console.log('Step results available:', stepResults);
        }
    }, [stepResults]);

    // Function to get status badge color
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
            case 'processing':
                return <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>;
            case 'failed':
                return <Badge className="bg-red-500 hover:bg-red-600"><AlertTriangle className="h-3 w-3 mr-1" /> Failed</Badge>;
            default:
                return <Badge className="bg-gray-500 hover:bg-gray-600"><Info className="h-3 w-3 mr-1" /> Unknown</Badge>;
        }
    };

    // Function to format date
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* Overview Card */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl font-bold">Table Analysis Summary</CardTitle>
                            <CardDescription>
                                Summary for step: {stepCode}
                            </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusBadge(summaryData.status)}
                            <Badge variant="outline" className="ml-2">
                                <FileSpreadsheet className="h-3 w-3 mr-1" /> Table Analysis
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-md">
                            <div className="text-sm font-medium text-gray-500 mb-1">Overall Confidence</div>
                            <div className="flex items-center">
                                <span className="text-2xl font-bold mr-2">{summaryData.confidence}%</span>
                                <Progress value={summaryData.confidence} className="h-2 flex-1" />
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <div className="text-sm font-medium text-gray-500 mb-1">Table Size</div>
                            <div className="text-2xl font-bold">{summaryData.tableStats.rowCount} × {summaryData.tableStats.columnCount}</div>
                            <div className="text-xs text-gray-500">{summaryData.tableStats.cellCount} cells total</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <div className="text-sm font-medium text-gray-500 mb-1">Completed At</div>
                            <div className="text-md font-medium">{formatDate(summaryData.completedAt)}</div>
                            <div className="text-xs text-gray-500">Duration: {summaryData.duration}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <div className="text-sm font-medium text-gray-500 mb-1">Quality Check</div>
                            <div className="flex items-center">
                                <div className="text-2xl font-bold mr-2">{summaryData.qualityMetrics.structureAccuracy}%</div>
                                <div className="text-xs">
                                    <div className="text-green-600">✓ Structure</div>
                                    <div className={summaryData.qualityMetrics.lowConfidenceCells > 0 ? "text-amber-600" : "text-green-600"}>
                                        {summaryData.qualityMetrics.lowConfidenceCells > 0 ? "⚠" : "✓"} Content
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Document information if available */}
                    {documentId && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-100">
                            <div className="flex items-center mb-2">
                                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                                <h3 className="text-md font-medium text-blue-700">Document Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Document ID</p>
                                    <p className="text-sm text-blue-600">{documentId}</p>
                                </div>
                                {metadata?.documentName && (
                                    <div>
                                        <p className="text-sm font-medium text-blue-700">Document Name</p>
                                        <p className="text-sm text-blue-600">{metadata.documentName}</p>
                                    </div>
                                )}
                                {metadata?.documentType && (
                                    <div>
                                        <p className="text-sm font-medium text-blue-700">Document Type</p>
                                        <p className="text-sm text-blue-600">{metadata.documentType}</p>
                                    </div>
                                )}
                                {metadata?.pageCount && (
                                    <div>
                                        <p className="text-sm font-medium text-blue-700">Page Count</p>
                                        <p className="text-sm text-blue-600">{metadata.pageCount} pages</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <Tabs defaultValue="details">
                        <TabsList className="mb-4">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="columns">Column Analysis</TabsTrigger>
                            <TabsTrigger value="issues">Issues & Recommendations</TabsTrigger>
                            {allStepResults && Object.keys(allStepResults).length > 0 && (
                                <TabsTrigger value="steps">Step Results</TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="details">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="text-md font-medium mb-3">Table Structure Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Header Row</p>
                                        <p className="text-sm">{summaryData.tableStats.headerRowDetected ? "Detected" : "Not Detected"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Footer Row</p>
                                        <p className="text-sm">{summaryData.tableStats.footerRowDetected ? "Detected" : "Not Detected"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Structure Accuracy</p>
                                        <p className="text-sm">{summaryData.qualityMetrics.structureAccuracy}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Content Accuracy</p>
                                        <p className="text-sm">{summaryData.qualityMetrics.contentAccuracy}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Header Accuracy</p>
                                        <p className="text-sm">{summaryData.qualityMetrics.headerAccuracy}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Low Confidence Cells</p>
                                        <p className="text-sm">{summaryData.qualityMetrics.lowConfidenceCells} cells</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="columns">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="text-md font-medium mb-3">Column Confidence Analysis</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Column Name</TableHead>
                                            <TableHead>Confidence</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {summaryData.columnConfidence.map((column, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{column.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <span className="mr-2">{column.confidence}%</span>
                                                        <Progress value={column.confidence} className="h-2 w-24" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {column.confidence >= 95 ? (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">High</Badge>
                                                    ) : column.confidence >= 90 ? (
                                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Good</Badge>
                                                    ) : column.confidence >= 80 ? (
                                                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Fair</Badge>
                                                    ) : (
                                                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Low</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="issues">
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h3 className="text-md font-medium mb-3">Detected Issues</h3>
                                    {summaryData.issues.length > 0 ? (
                                        <ul className="space-y-2">
                                            {summaryData.issues.map((issue, index) => (
                                                <li key={index} className="flex items-start">
                                                    {issue.type === 'warning' ? (
                                                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                                                    ) : (
                                                        <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium">{issue.message}</p>
                                                        {issue.affectedColumns && (
                                                            <p className="text-xs text-gray-500">
                                                                Affected columns: {issue.affectedColumns.join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">No issues detected</p>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h3 className="text-md font-medium mb-3">Recommendations</h3>
                                    {summaryData.recommendations.length > 0 ? (
                                        <ul className="list-disc pl-5 text-sm space-y-1">
                                            {summaryData.recommendations.map((recommendation, index) => (
                                                <li key={index}>{recommendation}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">No recommendations available</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {allStepResults && Object.keys(allStepResults).length > 0 && (
                            <TabsContent value="steps">
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h3 className="text-md font-medium mb-3">Analysis Steps</h3>
                                    <div className="space-y-4">
                                        {Object.entries(allStepResults).map(([stepKey, stepData], index) => (
                                            <div key={stepKey} className="border border-gray-200 rounded-md p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-medium">{stepData.name || `Step ${index + 1}`}</h4>
                                                    <Badge
                                                        className={
                                                            stepData.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                stepData.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                                    stepData.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                        }
                                                    >
                                                        {stepData.status || 'Unknown'}
                                                    </Badge>
                                                </div>

                                                {stepData.description && (
                                                    <p className="text-xs text-gray-500 mb-2">{stepData.description}</p>
                                                )}

                                                {stepData.metrics && (
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {Object.entries(stepData.metrics).map(([metricKey, metricValue]) => (
                                                            <div key={metricKey} className="text-xs">
                                                                <span className="font-medium text-gray-600">{metricKey}: </span>
                                                                <span>{String(metricValue)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {stepKey === stepCode && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <Badge className="bg-indigo-100 text-indigo-800">Current Step</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        )}
                    </Tabs>
                </CardContent>
            </Card>

            <div className="text-xs text-gray-400">
                Analysis ID: {analysisId} | Step: {stepCode} | Type: {analysisType}
            </div>
        </div>
    );
};

export default TableSummary; 