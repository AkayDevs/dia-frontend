import React, { useState, useEffect } from 'react';
import { BaseSummaryProps } from '../base';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    BarChart,
    CheckCircle,
    AlertTriangle,
    Info,
    FileSpreadsheet,
    FileText,
    Clock,
    Table as TableIcon,
    Download,
    ExternalLink,
    ChevronRight,
    Layers,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { AnalysisStatus } from '@/enums/analysis';
import { ANALYSIS_STATUS_COLORS } from '@/constants/icons';
import { getAnalysisIcon, getAnalysisName } from '@/constants/analysis/registry';
import { TableDetectionOutput } from '@/types/analysis/definitions/table_analysis/table_detection';
import { TableStructureOutput } from '@/types/analysis/definitions/table_analysis/table_structure';
import { TableDataOutput } from '@/types/analysis/definitions/table_analysis/table_data';
/**
 * Enhanced Table Analysis Summary Component
 * Provides a comprehensive summary of table analysis results
 */

interface TableInfo {
    id: string;
    name: string;
    page: number;
    rowCount: number;
    columnCount: number;
    cellCount: number;
    confidence: number;
    hasHeader: boolean;
    hasFooter: boolean;
}

interface QualityMetrics {
    structureAccuracy: number;
    contentAccuracy: number;
    headerAccuracy: number;
    lowConfidenceCells: number;
}

interface ColumnConfidence {
    name: string;
    confidence: number;
}

interface Issue {
    type: string;
    message: string;
    affectedColumns?: string[];
}

interface SummaryData {
    status: string;
    completedAt: string;
    createdAt: string;
    duration: string;
    confidence: number;
    tables: TableInfo[];
    qualityMetrics: QualityMetrics;
    columnConfidence: ColumnConfidence[];
    issues: Issue[];
    recommendations: string[];
}

const TableSummary: React.FC<BaseSummaryProps> = ({
    analysisId,
    analysisType,
    stepCode,
    analysisRun
}) => {
    // Process step results to get table information
    const processStepResults = () => {
        const detectionResults = analysisRun.step_results.find(
            result => result.step_code === 'table_analysis.table_detection' 
        )?.result as TableDetectionOutput;


        const structureResults = analysisRun.step_results.find(
            result => result.step_code === 'table_analysis.table_structure'
        )?.result as TableStructureOutput;

        const dataResults = analysisRun.step_results.find(
            result => result.step_code === 'table_analysis.table_data'
        )?.result as TableDataOutput;

        const tables = detectionResults?.results.flatMap(pageResult =>
            pageResult.tables.map((table, index) => {
                const structureTable = structureResults?.results
                    .flatMap(r => r.tables)
                    .find((_, i) => i === index);

                const dataTable = dataResults?.results
                    .flatMap(r => r.tables)
                    .find((_, i) => i === index);

                return {
                    id: `table-${index + 1}`,
                    name: `Table ${index + 1}`,
                    page: pageResult.page_info.page_number,
                    rowCount: structureTable?.num_rows || 0,
                    columnCount: structureTable?.num_cols || 0,
                    cellCount: (structureTable?.num_rows || 0) * (structureTable?.num_cols || 0),
                    confidence: Math.round((table.confidence.score || 0) * 100),
                    hasHeader: structureTable?.cells.some(cell => cell.is_header) || false,
                    hasFooter: false
                };
            })
        ) || [];

        // Calculate column confidence from data results
        const columnConfidence: ColumnConfidence[] = [];
        if (dataResults?.results.length && dataResults.results[0].tables.length) {
            const firstTable = dataResults.results[0].tables[0];
            if (firstTable.cells.length) {
                firstTable.cells[0].forEach((cell, index) => {
                    const confidenceSum = dataResults.results.reduce((acc, result) =>
                        acc + result.tables.reduce((tableAcc, table) =>
                            tableAcc + (table.cells[0]?.[index]?.confidence.score || 0), 0
                        ), 0
                    );
                    const avgConfidence = Math.round((confidenceSum / dataResults.results.length) * 100);
                    columnConfidence.push({
                        name: cell.text || `Column ${index + 1}`,
                        confidence: avgConfidence
                    });
                });
            }
        }

        // Calculate quality metrics
        const qualityMetrics = {
            structureAccuracy: Math.round(
                (structureResults?.results.reduce(
                    (acc, result) => acc + result.tables.reduce(
                        (tableAcc, table) => tableAcc + (table.confidence.score || 0), 0
                    ), 0
                ) / (structureResults?.results.length || 1) || 0) * 100
            ),
            contentAccuracy: Math.round(
                (dataResults?.results.reduce(
                    (acc, result) => acc + result.tables.reduce(
                        (tableAcc, table) => tableAcc + (table.confidence.score || 0), 0
                    ), 0
                ) / (dataResults?.results.length || 1) || 0) * 100
            ),
            headerAccuracy: Math.round(
                (structureResults?.results.reduce(
                    (acc, result) => acc + result.tables.reduce(
                        (tableAcc, table) => tableAcc +
                            (table.cells.filter(cell => cell.is_header).reduce(
                                (cellAcc, cell) => cellAcc + (cell.confidence.score || 0), 0
                            ) / (table.cells.filter(cell => cell.is_header).length || 1)), 0
                    ), 0
                ) / (structureResults?.results.length || 1) || 0) * 100
            ),
            lowConfidenceCells: dataResults?.results.reduce(
                (acc, result) => acc + result.tables.reduce(
                    (tableAcc, table) => tableAcc + table.cells.flat().filter(
                        cell => (cell.confidence.score || 0) < 0.75
                    ).length, 0
                ), 0
            ) || 0
        };

        // Generate issues based on analysis
        const issues: Issue[] = [];
        if (qualityMetrics.lowConfidenceCells > 0) {
            const lowConfColumns = columnConfidence
                .filter(col => col.confidence < 75)
                .map(col => col.name);
            issues.push({
                type: 'warning',
                message: `Low confidence in ${qualityMetrics.lowConfidenceCells} cells`,
                affectedColumns: lowConfColumns
            });
        }

        if (structureResults?.results.some(result =>
            result.tables.some(table =>
                table.cells.some(cell => cell.row_span > 1 || cell.col_span > 1)
            )
        )) {
            issues.push({
                type: 'info',
                message: 'Merged cells detected and resolved'
            });
        }

        // Generate recommendations based on issues
        const recommendations: string[] = [];
        if (qualityMetrics.lowConfidenceCells > 0) {
            recommendations.push('Review cells marked with low confidence');
        }
        if (qualityMetrics.headerAccuracy < 90) {
            recommendations.push('Verify header row detection accuracy');
        }
        if (qualityMetrics.contentAccuracy < 85) {
            recommendations.push('Check table content for potential extraction errors');
        }

        return {
            tables,
            qualityMetrics,
            columnConfidence,
            issues,
            recommendations
        };
    };

    const [summaryData, setSummaryData] = useState<SummaryData>({
        status: analysisRun.status || 'completed',
        completedAt: analysisRun.completed_at || new Date().toISOString(),
        createdAt: analysisRun.created_at || new Date(Date.now() - 105000).toISOString(),
        duration: '0s',
        confidence: 0,
        tables: [],
        qualityMetrics: {
            structureAccuracy: 0,
            contentAccuracy: 0,
            headerAccuracy: 0,
            lowConfidenceCells: 0
        },
        columnConfidence: [],
        issues: [],
        recommendations: []
    });

    // Calculate duration when timestamps change
    useEffect(() => {
        if (analysisRun.created_at && analysisRun.completed_at) {
            const start = new Date(analysisRun.created_at).getTime();
            const end = new Date(analysisRun.completed_at).getTime();
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
    }, [analysisRun.created_at, analysisRun.completed_at]);

    // Process step results when they change
    useEffect(() => {
        if (analysisRun.step_results) {
            const processedData = processStepResults();
            setSummaryData(prev => ({
                ...prev,
                ...processedData,
                confidence: Math.round(
                    processedData.tables.reduce((acc, table) => acc + table.confidence, 0) /
                    (processedData.tables.length || 1)
                )
            }));
        }
    }, [analysisRun.step_results]);

    // Function to format date
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    // Function to get confidence color
    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 95) return "text-green-600";
        if (confidence >= 85) return "text-blue-600";
        if (confidence >= 75) return "text-amber-600";
        return "text-red-600";
    };

    return (
        <div className="space-y-6">
            {/* Overview Card */}
            <Card className="border-border/40 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary/80 to-primary/60 h-1.5 w-full" />
                <CardHeader className="pb-3 bg-muted/20 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <span className="text-md font-medium text-muted-foreground">
                                    Analysis ID: {analysisId}
                                </span>
                            </CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                                {summaryData.tables.length} tables extracted from document
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                className={ANALYSIS_STATUS_COLORS[summaryData.status as keyof typeof ANALYSIS_STATUS_COLORS]}
                            >
                                {summaryData.status}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-5">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="space-y-1.5 p-3 bg-card/30 rounded-md border border-border/30 transition-all hover:border-border/50 hover:shadow-sm">
                            <div className="flex items-center text-xs font-medium text-muted-foreground">
                                <TableIcon className="h-3.5 w-3.5 mr-1.5 text-blue-500/80" />
                                <span>Tables Extracted</span>
                            </div>
                            <p className="text-xl font-medium text-foreground/90">{summaryData.tables.length}</p>
                            <p className="text-xs text-muted-foreground">
                                {summaryData.tables.reduce((acc, table) => acc + table.cellCount, 0)} total cells
                            </p>
                        </div>

                        <div className="space-y-1.5 p-3 bg-card/30 rounded-md border border-border/30 transition-all hover:border-border/50 hover:shadow-sm">
                            <div className="flex items-center text-xs font-medium text-muted-foreground">
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500/80" />
                                <span>Overall Confidence</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className={cn("text-xl font-medium", getConfidenceColor(summaryData.confidence))}>
                                    {summaryData.confidence}%
                                </p>
                                <Progress value={summaryData.confidence} className="h-1.5 w-16" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {summaryData.qualityMetrics.lowConfidenceCells} low confidence cells
                            </p>
                        </div>

                        <div className="space-y-1.5 p-3 bg-card/30 rounded-md border border-border/30 transition-all hover:border-border/50 hover:shadow-sm">
                            <div className="flex items-center text-xs font-medium text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500/80" />
                                <span>Processing Time</span>
                            </div>
                            <p className="text-xl font-medium text-foreground/90">{summaryData.duration}</p>
                            <p className="text-xs text-muted-foreground">
                                Completed {formatDistanceToNow(new Date(summaryData.completedAt), { addSuffix: true })}
                            </p>
                        </div>

                        <div className="space-y-1.5 p-3 bg-card/30 rounded-md border border-border/30 transition-all hover:border-border/50 hover:shadow-sm">
                            <div className="flex items-center text-xs font-medium text-muted-foreground">
                                <Layers className="h-3.5 w-3.5 mr-1.5 text-purple-500/80" />
                                <span>Structure Quality</span>
                            </div>
                            <p className={cn("text-xl font-medium", getConfidenceColor(summaryData.qualityMetrics.structureAccuracy))}>
                                {summaryData.qualityMetrics.structureAccuracy}%
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Headers: {summaryData.qualityMetrics.headerAccuracy}%</span>
                                <span>Content: {summaryData.qualityMetrics.contentAccuracy}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Document information if available */}
                    {analysisRun.document_id && (
                        <div className="mb-6 p-3 bg-blue-50/50 rounded-md border border-blue-100/70">
                            <div className="flex items-center mb-2">
                                <FileText className="h-4 w-4 text-blue-500/80 mr-2" />
                                <h3 className="text-sm font-medium text-blue-700/90">Document Information</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                    <p className="font-medium text-blue-700/90">Document ID</p>
                                    <p className="text-blue-600/80 truncate">
                                        {analysisRun.document_id}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-blue-700/90">Analysis ID</p>
                                    <p className="text-blue-600/80 truncate">
                                        {analysisId}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-blue-700/90">Analysis Type</p>
                                    <p className="text-blue-600/80">
                                        {String(getAnalysisName(analysisType).name)}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-blue-700/90">Status</p>
                                    <p className="text-blue-600/80">
                                        {analysisRun.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <Tabs defaultValue="tables" className="w-full">
                        <TabsList className="mb-4 bg-muted/50 p-0.5 border border-border/30">
                            <TabsTrigger value="tables" className="text-xs data-[state=active]:bg-background">
                                Extracted Tables
                            </TabsTrigger>
                            <TabsTrigger value="quality" className="text-xs data-[state=active]:bg-background">
                                Quality Analysis
                            </TabsTrigger>
                            <TabsTrigger value="issues" className="text-xs data-[state=active]:bg-background">
                                Issues & Recommendations
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tables" className="mt-0">
                            <div className="rounded-md border border-border/40 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="w-[180px]">Table Name</TableHead>
                                            <TableHead>Page</TableHead>
                                            <TableHead>Size</TableHead>
                                            <TableHead>Structure</TableHead>
                                            <TableHead>Confidence</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {summaryData.tables.map((table) => (
                                            <TableRow key={table.id} className="hover:bg-muted/20">
                                                <TableCell className="font-medium">{table.name}</TableCell>
                                                <TableCell>Page {table.page}</TableCell>
                                                <TableCell>
                                                    {table.rowCount} × {table.columnCount}
                                                    <span className="text-xs text-muted-foreground ml-1">
                                                        ({table.cellCount} cells)
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-xs">
                                                        <span>{table.hasHeader ? "Header ✓" : "No Header"}</span>
                                                        <span>{table.hasFooter ? "Footer ✓" : "No Footer"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn("text-sm font-medium", getConfidenceColor(table.confidence))}>
                                                            {table.confidence}%
                                                        </span>
                                                        <Progress
                                                            value={table.confidence}
                                                            className={cn(
                                                                "h-1.5 w-16",
                                                                table.confidence >= 95 ? "bg-green-100" :
                                                                    table.confidence >= 85 ? "bg-blue-100" :
                                                                        table.confidence >= 75 ? "bg-amber-100" : "bg-red-100"
                                                            )}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                                            <Download className="h-3 w-3 mr-1" />
                                                            Export
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                                            <ExternalLink className="h-3 w-3 mr-1" />
                                                            View
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="quality" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-border/40 rounded-md p-4 bg-card/30">
                                    <h3 className="text-sm font-medium mb-3 flex items-center">
                                        <BarChart className="h-4 w-4 mr-1.5 text-primary/70" />
                                        Column Confidence Analysis
                                    </h3>
                                    <div className="space-y-3">
                                        {summaryData.columnConfidence.map((column, index) => (
                                            <div key={index} className="space-y-1">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-medium">{column.name}</span>
                                                    <span className={getConfidenceColor(column.confidence)}>
                                                        {column.confidence}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all",
                                                            column.confidence >= 95 ? "bg-green-500/80" :
                                                                column.confidence >= 85 ? "bg-blue-500/80" :
                                                                    column.confidence >= 75 ? "bg-amber-500/80" : "bg-red-500/80"
                                                        )}
                                                        style={{ width: `${column.confidence}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border border-border/40 rounded-md p-4 bg-card/30">
                                    <h3 className="text-sm font-medium mb-3 flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-1.5 text-primary/70" />
                                        Quality Metrics
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Structure Accuracy</p>
                                            <div className="flex items-center gap-2">
                                                <p className={cn("text-sm font-medium", getConfidenceColor(summaryData.qualityMetrics.structureAccuracy))}>
                                                    {summaryData.qualityMetrics.structureAccuracy}%
                                                </p>
                                                <Progress
                                                    value={summaryData.qualityMetrics.structureAccuracy}
                                                    className="h-1.5 w-16"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Content Accuracy</p>
                                            <div className="flex items-center gap-2">
                                                <p className={cn("text-sm font-medium", getConfidenceColor(summaryData.qualityMetrics.contentAccuracy))}>
                                                    {summaryData.qualityMetrics.contentAccuracy}%
                                                </p>
                                                <Progress
                                                    value={summaryData.qualityMetrics.contentAccuracy}
                                                    className="h-1.5 w-16"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Header Accuracy</p>
                                            <div className="flex items-center gap-2">
                                                <p className={cn("text-sm font-medium", getConfidenceColor(summaryData.qualityMetrics.headerAccuracy))}>
                                                    {summaryData.qualityMetrics.headerAccuracy}%
                                                </p>
                                                <Progress
                                                    value={summaryData.qualityMetrics.headerAccuracy}
                                                    className="h-1.5 w-16"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Low Confidence Cells</p>
                                            <p className="text-sm font-medium">
                                                {summaryData.qualityMetrics.lowConfidenceCells} cells
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="issues" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-border/40 rounded-md p-4 bg-card/30">
                                    <h3 className="text-sm font-medium mb-3 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1.5 text-primary/70" />
                                        Detected Issues
                                    </h3>
                                    {summaryData.issues.length > 0 ? (
                                        <div className="space-y-3">
                                            {summaryData.issues.map((issue, index) => (
                                                <div key={index} className="flex items-start p-2 rounded-md bg-muted/30 border border-border/30">
                                                    {issue.type === 'warning' ? (
                                                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                                                    ) : (
                                                        <Info className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-medium">{issue.message}</p>
                                                        {issue.affectedColumns && (
                                                            <p className="text-[10px] text-muted-foreground">
                                                                Affected columns: {issue.affectedColumns.join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border/40 rounded-md bg-muted/10">
                                            <p>No issues detected</p>
                                        </div>
                                    )}
                                </div>

                                <div className="border border-border/40 rounded-md p-4 bg-card/30">
                                    <h3 className="text-sm font-medium mb-3 flex items-center">
                                        <CheckCircle2 className="h-4 w-4 mr-1.5 text-primary/70" />
                                        Recommendations
                                    </h3>
                                    {summaryData.recommendations.length > 0 ? (
                                        <div className="space-y-2">
                                            {summaryData.recommendations.map((recommendation, index) => (
                                                <div key={index} className="flex items-start">
                                                    <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-medium mr-2 mt-0.5">
                                                        {index + 1}
                                                    </div>
                                                    <p className="text-xs">{recommendation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border/40 rounded-md bg-muted/10">
                                            <p>No recommendations available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>

                <CardFooter className="bg-muted/10 border-t px-4 py-3 flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                        Analysis completed on {formatDate(summaryData.completedAt)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            Export All Tables
                        </Button>
                        <Button size="sm" className="h-8 text-xs bg-primary/90 hover:bg-primary">
                            View Detailed Results
                            <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default TableSummary; 