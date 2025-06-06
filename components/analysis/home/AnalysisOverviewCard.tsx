import { useMemo } from 'react';
import { Document } from '@/types/document';
import { AnalysisRunWithResultsInfo } from '@/types/analysis/base';
import { AnalysisStatus } from '@/enums/analysis';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow, format } from 'date-fns';
import { Avatar } from '@/components/ui/avatar';
import {
    BarChart4,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Layers
} from 'lucide-react';
import {
    ANALYSIS_STATUS_LABELS,
    ANALYSIS_STATUS_COLORS,
} from '@/constants/analysis';
import { ANALYSIS_STATUS_ICONS } from '@/constants/icons';
import {
    getAnalysisName,
    getAnalysisIcon,
    getAnalysisConstants,
    getAnalysisSteps
} from '@/constants/analysis/registry';
import { getDocumentTypeIcon } from '@/constants/icons';

interface AnalysisOverviewCardProps {
    document: Document;
    analyses: AnalysisRunWithResultsInfo[];
    onViewAnalysis: (analysisId: string) => void;
    onViewDocument: (documentId: string) => void;
    variant?: 'default' | 'compact' | 'modern' | 'analysis_type';
    groupBy?: 'document' | 'analysis_definition';
    analysisType?: string;
}

export const AnalysisOverviewCard = ({
    document,
    analyses,
    onViewAnalysis,
    onViewDocument,
    variant = 'default',
    groupBy = 'document',
    analysisType
}: AnalysisOverviewCardProps) => {
    // Sort analyses by created_at (newest first)
    const sortedAnalyses = useMemo(() => {
        return [...analyses].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [analyses]);

    // Get the latest analysis
    const latestAnalysis = useMemo(() =>
        sortedAnalyses.length > 0 ? sortedAnalyses[0] : null
        , [sortedAnalyses]);

    // Group analyses by analysis_code if needed
    const groupedAnalyses = useMemo(() => {
        if (groupBy === 'analysis_definition') {
            const groups: Record<string, AnalysisRunWithResultsInfo[]> = {};

            sortedAnalyses.forEach(analysis => {
                const key = analysis.analysis_code || 'unknown';
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(analysis);
            });

            return groups;
        }

        return { all: sortedAnalyses };
    }, [sortedAnalyses, groupBy]);

    // Get status counts
    const statusCounts = useMemo(() => {
        return {
            completed: analyses.filter(a => a.status === AnalysisStatus.COMPLETED).length,
            inProgress: analyses.filter(a => a.status === AnalysisStatus.IN_PROGRESS).length,
            failed: analyses.filter(a => a.status === AnalysisStatus.FAILED).length,
            pending: analyses.filter(a => a.status === AnalysisStatus.PENDING).length
        };
    }, [analyses]);

    // Helper function to get status icon
    const getStatusIcon = (status: string | undefined) => {
        if (!status) return <AlertCircle className="h-4 w-4 text-gray-400" />;
        return ANALYSIS_STATUS_ICONS[status as keyof typeof ANALYSIS_STATUS_ICONS] ||
            <AlertCircle className="h-4 w-4 text-gray-400" />;
    };

    // Helper function to get status color class
    const getStatusColorClass = (status: string | undefined) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        return ANALYSIS_STATUS_COLORS[status as keyof typeof ANALYSIS_STATUS_COLORS] ||
            'bg-gray-100 text-gray-800';
    };

    // Helper function to get status label
    const getStatusLabel = (status: string | undefined) => {
        if (!status) return 'Unknown';
        return ANALYSIS_STATUS_LABELS[status as keyof typeof ANALYSIS_STATUS_LABELS] ||
            'Unknown';
    };

    // Get document type icon
    const documentTypeIcon = useMemo(() => {
        return getDocumentTypeIcon(document.type.toString().toLowerCase());
    }, [document.type]);

    // Render analysis_type variant (2-column layout for analysis type details)
    if (variant === 'analysis_type' && analysisType) {
        // Get analysis definition details from registry
        const analysisName = getAnalysisName(analysisType);
        const analysisSteps = getAnalysisSteps(analysisType);
        const analysisIcon = getAnalysisIcon(analysisType);

        // Get status counts
        const completedCount = analyses.filter(a => a.status === AnalysisStatus.COMPLETED).length;
        const inProgressCount = analyses.filter(a => a.status === AnalysisStatus.IN_PROGRESS).length;
        const failedCount = analyses.filter(a => a.status === AnalysisStatus.FAILED).length;

        return (
            <Card className="overflow-hidden hover:shadow-md transition-all border border-border/60 shadow-sm">
                <div className="flex flex-col md:flex-row">
                    {/* First column: Analysis Type Details (1/3 or 2/5 width) */}
                    <div className="p-6 md:w-2/5 border-r bg-muted/5 flex flex-col">
                        {/* Header with icon and title */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shadow-sm">
                                {analysisIcon?.icon ? (
                                    <div dangerouslySetInnerHTML={{
                                        __html: analysisIcon.icon
                                    }} />
                                ) : (
                                    <BarChart4 className="h-6 w-6 text-primary" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-foreground">{analysisName.name}</h3>
                                <Badge variant="outline" className="mt-1.5 px-2.5 py-0.5 font-medium">
                                    {analyses.length} {analyses.length === 1 ? 'run' : 'runs'}
                                </Badge>
                            </div>
                        </div>

                        {/* Analysis Steps Section */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                <Layers className="h-4 w-4 mr-1.5 text-primary/70" />
                                Analysis Steps
                            </h4>
                            <div className="space-y-3 pl-1">
                                {analysisSteps.map((step, index) => (
                                    <div key={step.step_code} className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-medium shadow-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">{step.name}</span>
                                            <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status Summary Section */}
                        <div className="mt-auto pt-4 border-t border-border/50">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                <BarChart4 className="h-4 w-4 mr-1.5 text-primary/70" />
                                Status Summary
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col items-center p-3 rounded-md bg-green-50/50 border border-green-100 shadow-sm">
                                    <CheckCircle className="h-5 w-5 text-green-500 mb-1.5" />
                                    <span className="text-sm font-medium text-green-700">{completedCount}</span>
                                    <span className="text-xs text-green-600/80 mt-0.5">Completed</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-md bg-amber-50/50 border border-amber-100 shadow-sm">
                                    <Clock className="h-5 w-5 text-amber-500 mb-1.5" />
                                    <span className="text-sm font-medium text-amber-700">{inProgressCount}</span>
                                    <span className="text-xs text-amber-600/80 mt-0.5">In Progress</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-md bg-red-50/50 border border-red-100 shadow-sm">
                                    <XCircle className="h-5 w-5 text-red-500 mb-1.5" />
                                    <span className="text-sm font-medium text-red-700">{failedCount}</span>
                                    <span className="text-xs text-red-600/80 mt-0.5">Failed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Second column: Analysis Runs (2/3 or 3/5 width) */}
                    <div className="p-6 md:w-3/5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                                <Calendar className="h-4 w-4 mr-1.5 text-primary/70" />
                                Recent Analysis Runs
                            </h4>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-medium px-3"
                                onClick={() => onViewDocument(document.id)}
                            >
                                View All
                            </Button>
                        </div>

                        <ScrollArea className="h-[320px] pr-4">
                            <div className="space-y-3">
                                {sortedAnalyses.map((analysis) => (
                                    <div
                                        key={analysis.id || `analysis-${Math.random()}`}
                                        className="p-3 border rounded-md hover:bg-muted/10 transition-colors cursor-pointer shadow-sm"
                                        onClick={() => analysis.id && onViewAnalysis(analysis.id)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(analysis.status)}
                                                <span className="font-medium text-sm">
                                                    {format(new Date(analysis.created_at), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                            <Badge variant="outline" className={`px-2 ${getStatusColorClass(analysis.status)}`}>
                                                {getStatusLabel(analysis.status)}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                                            <span className="mr-1.5">
                                                {documentTypeIcon}
                                            </span>
                                            <span className="line-clamp-1">{document.name}</span>
                                        </div>

                                        {analysis.step_results && analysis.step_results.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-border/30 flex flex-wrap gap-1.5">
                                                {analysis.step_results.map((step, idx) => (
                                                    <Badge
                                                        key={step.id || idx}
                                                        variant="outline"
                                                        className="text-[9px] h-5 px-1.5 bg-primary/5 border-primary/20"
                                                    >
                                                        {step.step_code.split('.').pop()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </Card>
        );
    }

    // Render compact variant
    if (variant === 'compact') {
        return (
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-4" onClick={() => latestAnalysis?.id && onViewAnalysis(latestAnalysis.id)}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                                {latestAnalysis?.analysis_code ? (
                                    <div dangerouslySetInnerHTML={{
                                        __html: getAnalysisIcon(latestAnalysis.analysis_code)?.icon || ''
                                    }} />
                                ) : (
                                <BarChart4 className="h-5 w-5 text-primary" />
                                )}
                            </Avatar>
                            <div>
                                <h3 className="text-base font-medium line-clamp-1">
                                    {latestAnalysis?.analysis_code
                                        ? getAnalysisName(latestAnalysis.analysis_code).name
                                        : 'Unknown Analysis'}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-0.5 flex items-center">
                                    <span className="mr-1.5">{documentTypeIcon}</span>
                                    {document.name}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    {latestAnalysis && (
                                        <>
                                            <Badge variant="outline" className={getStatusColorClass(latestAnalysis.status)}>
                                                {getStatusLabel(latestAnalysis.status)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(latestAnalysis.created_at), { addSuffix: true })}
                                    </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center">
                                {latestAnalysis && getStatusIcon(latestAnalysis.status)}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    // Render modern variant
    if (variant === 'modern') {
        return (
            <Card className="overflow-hidden hover:shadow-md transition-all border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                                {documentTypeIcon}
                            </Avatar>
                            <div>
                                <h3 className="text-base font-medium line-clamp-1">{document.name}</h3>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {document.type.toString().toLowerCase()} document
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="rounded-full px-3">
                            {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="pb-2">
                    {/* Status indicators */}
                    <div className="flex items-center justify-between mb-3 mt-1 bg-muted/30 p-2 rounded-md">
                        <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{statusCounts.completed}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-amber-500" />
                                <span>{statusCounts.inProgress}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-red-500" />
                                <span>{statusCounts.failed}</span>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {latestAnalysis && (
                                <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {format(new Date(latestAnalysis.created_at), 'MMM d, yyyy')}
                        </span>
                            )}
                        </div>
                    </div>

                    {/* Analysis groups with ScrollArea */}
                    <div className="mb-2">
                        {Object.entries(groupedAnalyses).map(([groupKey, groupAnalyses]) => (
                            <div key={groupKey}>
                                {groupBy === 'analysis_definition' && groupKey !== 'all' && (
                                    <div className="flex items-center mb-1">
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                            {getAnalysisName(groupKey).name}
                                        </Badge>
                                    </div>
                                )}

                                <ScrollArea className="h-[120px] pr-4">
                                    <div className="space-y-1">
                                        {groupAnalyses.map((analysis) => (
                                            <div
                                                key={analysis.id || `analysis-${Math.random()}`}
                                                className="flex items-center justify-between p-1.5 hover:bg-muted/30 rounded cursor-pointer text-sm"
                                                onClick={() => analysis.id && onViewAnalysis(analysis.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(analysis.status)}
                                                    <span className="text-xs">
                                                        {groupBy !== 'analysis_definition' && analysis.analysis_code
                                                            ? getAnalysisName(analysis.analysis_code).name
                                                            : format(new Date(analysis.created_at), 'h:mm a')}
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className={`text-[10px] ${getStatusColorClass(analysis.status)}`}>
                                                    {getStatusLabel(analysis.status)}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        ))}
                </div>
                </CardContent>

                <CardFooter className="flex justify-end pt-2">
                    <Button
                        onClick={() => onViewDocument(document.id)}
                        size="sm"
                        className="text-xs"
                    >
                        View Document
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    // Default variant
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
            <div className="p-5 flex flex-col h-full">
                {/* Card header with document info */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold line-clamp-1">{document.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 capitalize flex items-center">
                            <span className="mr-1.5">{documentTypeIcon}</span>
                            {document.type.toString().toLowerCase()} document
                        </p>
                    </div>
                    <div className="h-6 w-6 flex items-center justify-center">
                        {documentTypeIcon}
                    </div>
                </div>

                {/* Analysis stats */}
                <div className="mt-4 flex-grow">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Analysis runs:</span>
                        <span className="font-medium">{analyses.length}</span>
                    </div>

                    {/* Status indicators */}
                    <div className="flex items-center gap-2 mb-2 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-muted-foreground">
                                {statusCounts.completed} completed
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                            <span className="text-muted-foreground">
                                {statusCounts.inProgress} in progress
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            <span className="text-muted-foreground">
                                {statusCounts.failed} failed
                            </span>
                        </div>
                    </div>

                    {/* Analysis list */}
                    {analyses.length > 0 ? (
                        <ScrollArea className="h-[180px] border rounded-md p-2">
                            <div className="space-y-2">
                                {Object.entries(groupedAnalyses).map(([groupKey, groupAnalyses]) => (
                                    <div key={groupKey} className="space-y-2">
                                        {groupBy === 'analysis_definition' && groupKey !== 'all' && (
                                            <div className="flex items-center px-2 py-1 bg-muted/30 rounded-sm">
                                                <Layers className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                                                <span className="text-xs font-medium">
                                                    {getAnalysisName(groupKey).name}
                                                </span>
                                            </div>
                                        )}

                                        {groupAnalyses.map((analysis) => (
                                            <div
                                                key={analysis.id || `analysis-${Math.random()}`}
                                        className="p-2 hover:bg-muted/50 rounded cursor-pointer border border-muted"
                                        onClick={() => analysis.id && onViewAnalysis(analysis.id)}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1.5">
                                                {getStatusIcon(analysis.status)}
                                                <span className="font-medium text-xs">
                                                            {groupBy !== 'analysis_definition' && analysis.analysis_code
                                                                ? getAnalysisName(analysis.analysis_code).name
                                                                : `Run #${analysis.id?.slice(-4) || 'Unknown'}`}
                                                </span>
                                            </div>
                                                    <Badge variant="outline" className={`text-[10px] ${getStatusColorClass(analysis.status)}`}>
                                                        {getStatusLabel(analysis.status)}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                            <div>
                                                Created: {format(new Date(analysis.created_at), 'MMM d, yyyy • h:mm a')}
                                            </div>
                                            {analysis.completed_at && (
                                                <div>
                                                    Completed: {format(new Date(analysis.completed_at), 'MMM d, yyyy • h:mm a')}
                                                </div>
                                            )}
                                        </div>
                                        {analysis.step_results && analysis.step_results.length > 0 && (
                                            <div className="mt-1 pt-1 border-t border-dashed border-muted">
                                                <div className="text-[10px] text-muted-foreground flex items-center">
                                                    <span className="mr-1">Steps:</span>
                                                    {analysis.step_results.map((step, idx) => (
                                                        <Badge key={step.id || idx} variant="outline" className="mr-1 text-[8px] h-4 px-1">
                                                            {step.step_code}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="h-[180px] border rounded-md flex items-center justify-center bg-muted/10">
                            <div className="text-center px-4">
                                <p className="text-xs text-muted-foreground">
                                    No analyses run yet. Start a new analysis to extract insights.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="mt-5 flex justify-end gap-2">
                    <Button
                        onClick={() => onViewDocument(document.id)}
                        variant="outline"
                        size="sm"
                    >
                        View Document
                    </Button>
                    <Button
                        onClick={() => onViewAnalysis(`new?documentId=${document.id}`)}
                        size="sm"
                        className="bg-primary/90 hover:bg-primary"
                    >
                        New Analysis
                    </Button>
                </div>
            </div>
        </Card>
    );
};