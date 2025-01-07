'use client';

import { useEffect } from 'react';
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
import { AnalysisType, AnalysisStatus } from '@/types/analysis';
import { motion } from 'framer-motion';
import {
    DocumentIcon,
    ChartBarIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
    // Document stats
    totalDocuments: number;
    analyzedDocuments: number;
    pendingAnalyses: number;
    failedAnalyses: number;

    // Analysis stats
    totalAnalyses: number;
    analysisSuccessRate: number;
    mostUsedAnalysisType: {
        type: string;
        count: number;
    };
    averageAnalysisTime: number; // in minutes
}

const initialStats: DashboardStats = {
    totalDocuments: 0,
    analyzedDocuments: 0,
    pendingAnalyses: 0,
    failedAnalyses: 0,
    totalAnalyses: 0,
    analysisSuccessRate: 0,
    mostUsedAnalysisType: {
        type: '',
        count: 0
    },
    averageAnalysisTime: 0
};

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isAuthenticated, user, logout } = useAuthStore();
    const {
        documents = [],
        isLoading: isLoadingDocs,
        error: docError,
        fetchDocuments,
        uploadDocument,
        uploadDocuments,
        deleteDocument,
        setFilters: setDocFilters,
        clearError: clearDocError
    } = useDocumentStore();

    const {
        analyses = [],
        availableTypes = [],
        isLoading: isLoadingAnalyses,
        error: analysisError,
        fetchAnalyses,
        loadAvailableTypes
    } = useAnalysisStore();

    // Initialize dashboard with recent documents and analyses
    useEffect(() => {
        if (isAuthenticated) {
            setDocFilters({ limit: 5 }); // Show only 5 recent documents
            const loadData = async () => {
                try {
                    await Promise.all([
                        fetchDocuments(),
                        fetchAnalyses(),
                        loadAvailableTypes()
                    ]);
                } catch (error) {
                    if (error instanceof Error && error.message.includes('authentication')) {
                        logout();
                        router.push('/login');
                    }
                }
            };
            loadData();
        }
    }, [isAuthenticated, setDocFilters, fetchDocuments, fetchAnalyses, loadAvailableTypes, logout, router]);

    // Calculate dashboard stats from documents and analyses
    const calculateStats = (): DashboardStats => {
        if (!Array.isArray(documents) || !Array.isArray(analyses)) {
            return initialStats;
        }

        // Calculate document-related stats
        const docStats = documents.reduce((stats, doc) => {
            stats.totalDocuments += 1;
            switch (doc.status) {
                case 'completed':
                    stats.analyzedDocuments += 1;
                    break;
                case 'pending':
                case 'processing':
                    stats.pendingAnalyses += 1;
                    break;
                case 'failed':
                    stats.failedAnalyses += 1;
                    break;
            }
            return stats;
        }, { ...initialStats });

        // Calculate analysis-related stats
        const analysisStats = analyses.reduce((stats, analysis) => {
            stats.totalAnalyses += 1;

            // Calculate success rate
            if (analysis.status === AnalysisStatus.COMPLETED) {
                stats.analysisSuccessRate += 1;
            } else if (analysis.status === AnalysisStatus.FAILED) {
                stats.failedAnalyses += 1;
            } else if (analysis.status === AnalysisStatus.PENDING || analysis.status === AnalysisStatus.PROCESSING) {
                stats.pendingAnalyses += 1;
            }

            // Track analysis types usage
            const currentTypeCount = analyses.filter(a => a.type === analysis.type).length;
            if (currentTypeCount > stats.mostUsedAnalysisType.count) {
                stats.mostUsedAnalysisType = {
                    type: analysis.type,
                    count: currentTypeCount
                };
            }

            return stats;
        }, docStats);

        // Calculate average duration separately for better clarity
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
        } else {
            analysisStats.averageAnalysisTime = -1; // Use -1 to indicate no completed analyses
        }

        // Finalize success rate calculation
        if (analysisStats.totalAnalyses > 0) {
            analysisStats.analysisSuccessRate = (analysisStats.analysisSuccessRate / analysisStats.totalAnalyses) * 100;
        }

        return analysisStats;
    };

    const handleUploadSuccess = async (file: File) => {
        try {
            await uploadDocument(file);
            toast({
                description: "Document uploaded successfully",
                duration: 3000,
            });
        } catch (error) {
            handleError(error);
        }
    };

    const handleBatchUpload = async (files: File[]) => {
        try {
            await uploadDocuments(files);
            toast({
                description: `${files.length} documents uploaded successfully`,
                duration: 3000,
            });
        } catch (error) {
            handleError(error);
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        try {
            await deleteDocument(documentId);
            toast({
                description: "Document deleted successfully",
                duration: 3000,
            });
        } catch (error) {
            handleError(error);
        }
    };

    const handleError = (error: any) => {
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
    };

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
    const stats = calculateStats();

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

                        <div className="grid gap-4">
                            <Card className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10">
                                        <ChartBarIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-semibold">Quick Analysis</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Start analyzing your documents
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full mt-4"
                                    onClick={() => router.push('/dashboard/analysis')}
                                >
                                    Start Analysis
                                </Button>
                            </Card>

                            <Card className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10">
                                        <DocumentDuplicateIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-semibold">Batch Processing</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Process multiple documents
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full mt-4"
                                    variant="outline"
                                    onClick={() => router.push('/dashboard/batch')}
                                >
                                    Start Batch Process
                                </Button>
                            </Card>
                        </div>
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