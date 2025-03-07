'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { AnalysisMode } from '@/enums/analysis';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Import our new components
import { useDashboardStats } from '@/components/dashboard/use-dashboard-stats';
import { UploadSection } from '@/components/dashboard/upload-section';
import { RecentAnalyses } from '@/components/dashboard/recent-analyses';
import { RecentDocuments } from '@/components/dashboard/recent-documents';
import { ErrorDisplay } from '@/components/dashboard/error-display';

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

    // Use our custom hook to calculate dashboard stats
    const stats = useDashboardStats(documents, analyses, analysisDefinitions);

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

    const handleError = (error: any) => {
        toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "An error occurred",
            duration: 5000,
        });
    };

    // Combine errors from different sources
    const error = docError || analysisError;
    const isLoading = isLoadingDocs || isLoadingAnalyses;

    if (isLoading) {
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

    return (
        <div className="container py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
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
                <ErrorDisplay error={error} />
            ) : (
                <>
                    <StatsOverview stats={stats} />

                    <div className="grid gap-6 md:grid-cols-2">
                        <UploadSection
                            onUploadSuccess={handleUploadSuccess}
                            onBatchUpload={handleBatchUpload}
                            onError={handleError}
                        />

                        <RecentAnalyses analyses={stats.analyses} />
                    </div>

                    <RecentDocuments
                        documents={documents}
                        onDeleteDocument={handleDeleteDocument}
                        isLoading={isLoadingDocs}
                    />
                </>
            )}
        </div>
    );
} 