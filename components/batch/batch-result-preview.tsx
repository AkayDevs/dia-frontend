'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ChevronLeft,
    ChevronRight,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Download,
    ExternalLink
} from 'lucide-react';
import { Document } from '@/types/document';
import { AnalysisRunWithResults, StepResultResponse } from '@/types/analysis/base';
import { AnalysisDefinitionCode, TableAnalysisStepCode } from '@/types/analysis';
import { AnalysisStatus } from '@/enums/analysis';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface BatchResultPreviewProps {
    document: Document;
    analysis: AnalysisRunWithResults;
    onClose?: () => void;
}

export const BatchResultPreview = ({ document, analysis, onClose }: BatchResultPreviewProps) => {
    const router = useRouter();
    const { fetchDocumentPages, currentPages, isPagesLoading } = useDocumentStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<string>("overview");

    // Fetch document pages when document ID is available
    useEffect(() => {
        if (document?.id) {
            fetchDocumentPages(document.id);
        }
    }, [document, fetchDocumentPages]);

    // Get the latest step result for visualization
    const getLatestStepResult = (): StepResultResponse | null => {
        if (!analysis?.step_results || analysis.step_results.length === 0) {
            return null;
        }
        return analysis.step_results[analysis.step_results.length - 1];
    };

    const latestStep = getLatestStepResult();

    // Get total pages from the result
    const totalPages = latestStep?.result?.total_pages_processed || 1;

    // Handle page navigation
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    // Navigate to full analysis view
    const viewFullAnalysis = () => {
        if (document?.id && analysis?.id) {
            router.push(`/dashboard/documents/${document.id}/analysis/${analysis.id}`);
        }
    };

    // Get status badge
    const getStatusBadge = (status: AnalysisStatus) => {
        switch (status) {
            case AnalysisStatus.COMPLETED:
                return {
                    icon: <CheckCircle className="h-4 w-4" />,
                    className: 'bg-green-500/10 text-green-500'
                };
            case AnalysisStatus.FAILED:
            case AnalysisStatus.CANCELLED:
                return {
                    icon: <XCircle className="h-4 w-4" />,
                    className: 'bg-red-500/10 text-red-500'
                };
            case AnalysisStatus.IN_PROGRESS:
                return {
                    icon: <Clock className="h-4 w-4" />,
                    className: 'bg-blue-500/10 text-blue-500'
                };
            default:
                return {
                    icon: <Clock className="h-4 w-4" />,
                    className: 'bg-yellow-500/10 text-yellow-500'
                };
        }
    };

    const statusBadge = getStatusBadge(analysis?.status || AnalysisStatus.PENDING);

    // Render loading state
    if (isPagesLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-48" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-full" />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-[400px] w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Render empty state if no results
    if (!latestStep || !latestStep.result) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>{document?.name || 'Document'}</span>
                        <Badge variant="outline" className={cn('gap-1', statusBadge.className)}>
                            {statusBadge.icon}
                            {analysis?.status || 'Pending'}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        No analysis results available yet
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                        <FileText className="h-12 w-12 mb-4 opacity-30" />
                        <p>Analysis is in progress or has not started</p>
                        {analysis?.error_message && (
                            <p className="text-red-500 mt-2">{analysis.error_message}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{document.name}</span>
                    <Badge variant="outline" className={cn('gap-1', statusBadge.className)}>
                        {statusBadge.icon}
                        {analysis.status}
                    </Badge>
                </CardTitle>
                <CardDescription>
                    Analysis results for {analysis.analysis_code}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-6 pt-2">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="results">Results</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="p-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Document Info</h3>
                                    <div className="text-sm">
                                        <p><span className="font-medium">Name:</span> {document.name}</p>
                                        <p><span className="font-medium">Type:</span> {document.type}</p>
                                        <p><span className="font-medium">Size:</span> {(document.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Analysis Info</h3>
                                    <div className="text-sm">
                                        <p><span className="font-medium">Type:</span> {analysis.analysis_code}</p>
                                        <p><span className="font-medium">Mode:</span> {analysis.mode}</p>
                                        <p><span className="font-medium">Status:</span> {analysis.status}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Steps</h3>
                                <div className="space-y-2">
                                    {analysis.step_results.map((step, index) => {
                                        const stepStatus = getStatusBadge(step.status as unknown as AnalysisStatus);
                                        return (
                                            <div key={step.id} className="flex items-center justify-between p-2 border rounded-md">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={cn('gap-1', stepStatus.className)}>
                                                        {stepStatus.icon}
                                                    </Badge>
                                                    <span className="text-sm">{step.step_code}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {step.completed_at
                                                        ? new Date(step.completed_at).toLocaleString()
                                                        : 'In progress'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" size="sm" onClick={viewFullAnalysis}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Full Analysis
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="results" className="space-y-4">
                        <div className="flex items-center justify-between px-6">
                            <h3 className="text-sm font-medium">Results Preview</h3>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="h-[400px] border-t">
                            <div className="relative w-full h-full p-6">
                                {/* This is where you would render the visualizer component based on the step type */}
                                {/* For now, we'll just show a placeholder */}
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <FileText className="h-12 w-12 mb-4 opacity-30" />
                                    <p>Results preview for {latestStep.step_code}</p>
                                    <p className="text-sm mt-2">
                                        View the full analysis for detailed results
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-4" onClick={viewFullAnalysis}>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Full Analysis
                                    </Button>
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}; 