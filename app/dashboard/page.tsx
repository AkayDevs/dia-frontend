'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DocumentList } from '@/components/documents/document-list';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { UploadHandler } from '@/components/ui/upload-handler';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { AnalysisRunWithResults } from '@/types/analysis_execution';
import { AnalysisStatus, AnalysisDefinitionInfo } from '@/types/analysis_configs';
import { Document, DocumentWithAnalysis } from '@/types/document';
import { motion } from 'framer-motion';
import {
    DocumentIcon,
    ChartBarIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    DocumentDuplicateIcon,
    DocumentTextIcon as FileText,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface OngoingAnalysis {
    documentName: string;
    type: string;
    startedAt: string;
}

interface DashboardAnalysis extends AnalysisRunWithResults {
    type: string;
}

interface DashboardStats {
    // Document stats
    totalDocuments: number;
    analyzedDocuments: number;
    failedAnalyses: number;

    // Analysis stats
    totalAnalyses: number;
    analysisSuccessRate: number;
    ongoingAnalyses: {
        count: number;
        items: OngoingAnalysis[];
    };
    mostUsedAnalysisType: {
        type: string;
        count: number;
    };
    averageAnalysisTime: number;
    analyses: DashboardAnalysis[];
}

const initialStats: DashboardStats = {
    totalDocuments: 0,
    analyzedDocuments: 0,
    failedAnalyses: 0,
    totalAnalyses: 0,
    analysisSuccessRate: 0,
    ongoingAnalyses: {
        count: 0,
        items: []
    },
    mostUsedAnalysisType: {
        type: '',
        count: 0
    },
    averageAnalysisTime: 0,
    analyses: []
};

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isAuthenticated, user, logout } = useAuthStore();
    const {
        documents,
        isLoading: isLoadingDocs,
        error: docError,
        fetchDocuments,
        uploadDocument,
        uploadDocuments,
        deleteDocument,
        setFilters,
        clearError: clearDocError
    } = useDocumentStore();

    const {
        analyses,
        isLoading: isLoadingAnalyses,
        error: analysisError,
        fetchUserAnalyses,
        analysisDefinitions,
        fetchAnalysisDefinitions
    } = useAnalysisStore();

    // Initialize dashboard with recent documents and analyses
    useEffect(() => {
        if (!isAuthenticated) return;

        setFilters({ limit: 5 }); // Show only 5 recent documents
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchDocuments(),
                    fetchUserAnalyses({ limit: 100 }), // Fetch recent analyses
                    fetchAnalysisDefinitions()
                ]);
            } catch (error) {
                if (error instanceof Error && error.message.includes('authentication')) {
                    logout();
                    router.push('/login');
                }
            }
        };
        loadData();
    }, [isAuthenticated, setFilters, fetchDocuments, fetchUserAnalyses, fetchAnalysisDefinitions, logout, router]);

    // Calculate dashboard stats from documents and analyses
    const stats = useMemo((): DashboardStats => {
        if (!Array.isArray(documents) || !Array.isArray(analyses)) {
            return initialStats;
        }

        const typedDocuments = documents as Array<DocumentWithAnalysis>;

        // Calculate document-related stats
        const docStats = typedDocuments.reduce((stats, doc) => {
            stats.totalDocuments += 1;
            if (doc.analyses?.some(a => a.status === AnalysisStatus.COMPLETED)) {
                stats.analyzedDocuments += 1;
            }
            if (doc.analyses?.some(a => a.status === AnalysisStatus.FAILED)) {
                stats.failedAnalyses += 1;
            }
            return stats;
        }, { ...initialStats });

        // Calculate analysis-related stats
        const analysisStats = analyses.reduce((stats, analysis) => {
            stats.totalAnalyses += 1;
            const analysisDefinition = analysisDefinitions?.find(def => def.code === analysis.analysis_code);

            // Add analysis with type information
            if (analysisDefinition) {
                stats.analyses.push({
                    ...analysis,
                    type: analysisDefinition.name
                });
            }

            // Calculate success rate
            if (analysis.status === AnalysisStatus.COMPLETED) {
                stats.analysisSuccessRate += 1;
            } else if (analysis.status === AnalysisStatus.FAILED) {
                stats.failedAnalyses += 1;
            }

            // Track ongoing analyses
            if (analysis.status === AnalysisStatus.IN_PROGRESS) {
                const document = typedDocuments.find(doc => doc.id === analysis.document_id);
                if (document && analysisDefinition) {
                    stats.ongoingAnalyses.items.push({
                        documentName: document.name,
                        type: analysisDefinition.name,
                        startedAt: analysis.created_at
                    });
                }
            }

            // Update ongoing analyses count to match the actual in-progress analyses
            stats.ongoingAnalyses.count = analyses.filter(a => a.status === AnalysisStatus.IN_PROGRESS).length;

            // Track analysis types usage
            if (analysisDefinition) {
                const currentTypeCount = analyses.filter(a => a.analysis_code === analysis.analysis_code).length;
                if (currentTypeCount > stats.mostUsedAnalysisType.count) {
                    stats.mostUsedAnalysisType = {
                        type: analysisDefinition.name,
                        count: currentTypeCount
                    };
                }
            }

            return stats;
        }, docStats);

        // Calculate average duration for completed analyses
        const completedAnalyses = analyses.filter(a =>
            a.status === AnalysisStatus.COMPLETED &&
            a.completed_at &&
            a.created_at
        );

        if (completedAnalyses.length > 0) {
            const totalDuration = completedAnalyses.reduce((total, analysis) => {
                const startTime = new Date(analysis.created_at).getTime();
                const endTime = new Date(analysis.completed_at!).getTime();
                return total + ((endTime - startTime) / (1000 * 60)); // Convert to minutes
            }, 0);
            analysisStats.averageAnalysisTime = totalDuration / completedAnalyses.length;
        }

        // Finalize success rate calculation
        if (analysisStats.totalAnalyses > 0) {
            analysisStats.analysisSuccessRate = (analysisStats.analysisSuccessRate / analysisStats.totalAnalyses) * 100;
        }

        return analysisStats;
    }, [documents, analyses, analysisDefinitions]);

    const handleUploadSuccess = useCallback(async (file: File) => {
        try {
            await uploadDocument(file);
            toast({
                description: "Document uploaded successfully",
                duration: 3000,
            });
        } catch (error) {
            handleError(error);
        }
    }, [uploadDocument, toast]);

    const handleBatchUpload = useCallback(async (files: File[]) => {
        try {
            await uploadDocuments(files);
            toast({
                description: `${files.length} documents uploaded successfully`,
                duration: 3000,
            });
        } catch (error) {
            handleError(error);
        }
    }, [uploadDocuments, toast]);

    const handleDeleteDocument = useCallback(async (documentId: string) => {
        try {
            await deleteDocument(documentId);
            toast({
                description: "Document deleted successfully",
                duration: 3000,
            });
        } catch (error) {
            handleError(error);
        }
    }, [deleteDocument, toast]);

    const handleError = useCallback((error: unknown) => {
        const message = error instanceof Error ? error.message : 'An error occurred';

        if (message.includes('authentication')) {
            logout();
            router.push('/login');
            toast({
                title: "Session Expired",
                description: "Please log in again to continue.",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Error",
            description: message,
            variant: "destructive",
        });
    }, [logout, router, toast]);

    if (isLoadingDocs || isLoadingAnalyses) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
            </div>
        );
    }

    const error = docError || analysisError;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-lg text-muted-foreground">
                        Welcome back, {user?.name || 'User'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => {
                        clearDocError();
                        fetchDocuments();
                    }}
                    className="gap-2"
                >
                    <ArrowPathIcon className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            {error ? (
                <Card className="p-6 bg-destructive/10 border-destructive/20">
                    <div className="flex items-center gap-3 text-destructive">
                        <ExclamationCircleIcon className="w-5 h-5" />
                        <p>{error}</p>
                    </div>
                </Card>
            ) : (
                <>
                    <StatsOverview stats={stats} />

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <DocumentIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-semibold">Upload Documents</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Drag and drop or click to upload
                                    </p>
                                </div>
                            </div>
                            <UploadHandler
                                onSuccess={handleUploadSuccess}
                                onBatchUpload={handleBatchUpload}
                                onError={handleError}
                                className="h-[200px]"
                                accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                                multiple
                            />
                        </Card>

                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <ChartBarIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-semibold">Analysis Status</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Current state of analysis runs
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-2">
                                        <ArrowPathIcon className="w-4 h-4 text-blue-500 animate-spin" />
                                        <span className="text-sm font-medium">In Progress</span>
                                    </div>
                                    <p className="text-2xl font-semibold mt-1">
                                        {analyses.filter(a => a.status === 'in_progress').length}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-medium">Completed</span>
                                    </div>
                                    <p className="text-2xl font-semibold mt-1">
                                        {analyses.filter(a => a.status === 'completed').length}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-2">
                                        <ExclamationCircleIcon className="w-4 h-4 text-red-500" />
                                        <span className="text-sm font-medium">Failed</span>
                                    </div>
                                    <p className="text-2xl font-semibold mt-1">
                                        {analyses.filter(a => a.status === 'failed').length}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm font-medium">Pending</span>
                                    </div>
                                    <p className="text-2xl font-semibold mt-1">
                                        {analyses.filter(a => a.status === 'pending').length}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">Recent Documents</h2>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/dashboard/documents')}
                            >
                                View All
                            </Button>
                        </div>
                        <DocumentList
                            documents={documents}
                            onDelete={handleDeleteDocument}
                            isCompact
                        />
                    </div>
                </>
            )}
        </div>
    );
} 