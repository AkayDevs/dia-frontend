'use client';

import { useState, useEffect } from 'react';
import { SummaryProps } from '../../interfaces';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { TableAnalysisConfig } from '@/types/analysis/types/table_analysis';
import { TableAnalysisResult } from '@/types/analysis/types/table_analysis';
import { AnalysisStatus } from '@/types/analysis/base';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Download, Table, FileSpreadsheet, Clock, Calendar } from 'lucide-react';
import { ANALYSIS_STATUS_LABELS, ANALYSIS_STATUS_COLORS } from '@/constants/analysis';

export function Summary({ analysisId, documentId, result: initialResult, config: initialConfig }: SummaryProps) {
    const { getAnalysis, getAnalysisResult } = useAnalysisStore();
    const [result, setResult] = useState<TableAnalysisResult | null>(initialResult as TableAnalysisResult || null);
    const [config, setConfig] = useState<TableAnalysisConfig | null>(initialConfig as TableAnalysisConfig || null);
    const [isLoading, setIsLoading] = useState(!initialResult || !initialConfig);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialResult && initialConfig) {
            setResult(initialResult as TableAnalysisResult);
            setConfig(initialConfig as TableAnalysisConfig);
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [analysisData, resultData] = await Promise.all([
                    getAnalysis(analysisId),
                    getAnalysisResult(analysisId)
                ]);

                setConfig(analysisData as TableAnalysisConfig);
                setResult(resultData as TableAnalysisResult);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load analysis data');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [analysisId, getAnalysis, getAnalysisResult, initialConfig, initialResult]);

    const getStatusBadge = (status: AnalysisStatus) => {
        const label = ANALYSIS_STATUS_LABELS[status] || status;
        const colorClass = ANALYSIS_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                {label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-destructive">
                <AlertCircle className="h-5 w-5 mb-2" />
                <p>{error}</p>
            </div>
        );
    }

    if (!result || !config) {
        return (
            <div className="p-4 text-muted-foreground">
                <p>No analysis data available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Table Analysis Summary</h2>
                    <p className="text-sm text-muted-foreground">
                        Summary of table analysis results and configuration.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {getStatusBadge(result.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Analysis Results</CardTitle>
                        <CardDescription>
                            Summary of detected tables and extraction results
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Table className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <span>Tables Detected</span>
                                </div>
                                <span className="font-medium">{result.tables?.length || 0}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <span>Processing Time</span>
                                </div>
                                <span className="font-medium">
                                    {result.metadata?.processingTime ? `${result.metadata.processingTime}s` : 'N/A'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <span>Completed At</span>
                                </div>
                                <span className="font-medium">
                                    {formatDate(result.createdAt)}
                                </span>
                            </div>

                            {result.tables && result.tables.length > 0 && (
                                <div className="pt-4">
                                    <h4 className="text-sm font-medium mb-2">Detected Tables</h4>
                                    <div className="space-y-2">
                                        {result.tables.map((table, index) => (
                                            <div key={table.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                                                <span>Table {index + 1}</span>
                                                <span>{table.rowCount} rows × {table.columnCount} columns</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <Button variant="outline" className="w-full">
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    Download All Tables
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Analysis Configuration</CardTitle>
                        <CardDescription>
                            Configuration settings used for this analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Detection Options</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Detect Header Rows</span>
                                        <span>{config.tableOptions.detectHeaderRows ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Detect Header Columns</span>
                                        <span>{config.tableOptions.detectHeaderColumns ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Minimum Confidence</span>
                                        <span>{Math.round(config.tableOptions.minConfidence * 100)}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Include Rulings</span>
                                        <span>{config.tableOptions.includeRulings ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-2">Extraction Options</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Output Format</span>
                                        <span className="uppercase">{config.extractionOptions.outputFormat}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Include Confidence Scores</span>
                                        <span>{config.extractionOptions.includeConfidenceScores ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Include Coordinates</span>
                                        <span>{config.extractionOptions.includeCoordinates ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Normalize Whitespace</span>
                                        <span>{config.extractionOptions.normalizeWhitespace ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 