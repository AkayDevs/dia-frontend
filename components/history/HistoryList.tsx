import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Eye,
    RotateCw,
    Trash2,
    FileDown,
    FileText,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import { AnalysisRunWithResults, AnalysisRunWithResultsInfo } from '@/types/analysis/base';
import { AnalysisStatus, AnalysisMode } from '@/enums/analysis';
import { Document } from '@/types/document';
import { HistoryEmptyState } from './HistoryEmptyState';

interface HistoryListProps {
    analyses: (AnalysisRunWithResults | AnalysisRunWithResultsInfo)[];
    documents: Record<string, Document>;
    isLoading: boolean;
    searchQuery: string;
    statusFilter: AnalysisStatus | 'ALL';
    onViewResults: (analysis: AnalysisRunWithResults | AnalysisRunWithResultsInfo) => void;
    onExportResults: (analysis: AnalysisRunWithResults | AnalysisRunWithResultsInfo) => void;
    onRerunAnalysis: (analysis: AnalysisRunWithResults | AnalysisRunWithResultsInfo) => void;
    onDeleteAnalysis: (analysis: AnalysisRunWithResults | AnalysisRunWithResultsInfo) => void;
    onStartNewAnalysis: () => void;
}

export function HistoryList({
    analyses,
    documents,
    isLoading,
    searchQuery,
    statusFilter,
    onViewResults,
    onExportResults,
    onRerunAnalysis,
    onDeleteAnalysis,
    onStartNewAnalysis
}: HistoryListProps) {
    // Filter analyses based on search query and status filter
    const filteredAnalyses = analyses.filter(analysis => {
        const document = documents[analysis.document_id];
        const matchesSearch = document?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        const matchesStatus = statusFilter === 'ALL' || analysis.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Helper function to get status icon
    const getStatusIcon = (status: AnalysisStatus) => {
        switch (status) {
            case AnalysisStatus.COMPLETED:
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case AnalysisStatus.IN_PROGRESS:
                return <Clock className="h-4 w-4 text-blue-500" />;
            case AnalysisStatus.FAILED:
                return <XCircle className="h-4 w-4 text-red-500" />;
            case AnalysisStatus.PENDING:
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case AnalysisStatus.CANCELLED:
                return <XCircle className="h-4 w-4 text-gray-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    // Helper function to get status color
    const getStatusColor = (status: AnalysisStatus) => {
        switch (status) {
            case AnalysisStatus.COMPLETED:
                return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case AnalysisStatus.IN_PROGRESS:
                return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case AnalysisStatus.FAILED:
                return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
            case AnalysisStatus.PENDING:
                return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
            case AnalysisStatus.CANCELLED:
                return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Analysis Records</CardTitle>
                <CardDescription>
                    View, manage, and export your analysis results
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <RotateCw className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredAnalyses.length === 0 ? (
                            <HistoryEmptyState
                                hasFilters={searchQuery !== '' || statusFilter !== 'ALL'}
                                onStartAnalysis={onStartNewAnalysis}
                            />
                        ) : (
                            filteredAnalyses.map((analysis) => (
                                <motion.div
                                    key={analysis.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10 mt-1">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">
                                                    {documents[analysis.document_id]?.name || 'Unknown Document'}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(analysis.created_at), 'PPpp')}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className="mt-2 text-xs capitalize"
                                                >
                                                    {analysis.mode}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="mt-2 ml-2 text-xs"
                                                >
                                                    {analysis.analysis_code}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge
                                                variant="secondary"
                                                className={`gap-1 capitalize ${getStatusColor(analysis.status as AnalysisStatus)}`}
                                            >
                                                {getStatusIcon(analysis.status as AnalysisStatus)}
                                                {analysis.status.toLowerCase()}
                                            </Badge>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onViewResults(analysis)}
                                                    title="View Results"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onExportResults(analysis)}
                                                    title="Export Results"
                                                    disabled={analysis.status !== AnalysisStatus.COMPLETED}
                                                >
                                                    <FileDown className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onRerunAnalysis(analysis)}
                                                    title="Re-run Analysis"
                                                    disabled={analysis.status === AnalysisStatus.IN_PROGRESS}
                                                >
                                                    <RotateCw className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDeleteAnalysis(analysis)}
                                                    title="Delete Analysis"
                                                    className="text-destructive hover:text-destructive/90"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
} 