'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

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
        isLoading: docIsLoading,
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
        isLoading: analysisIsLoading,
        error: analysisError,
        fetchUserAnalyses,
        analysisDefinitions,
        fetchAnalysisDefinitions
    } = useAnalysisStore();

    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        setFilters({ limit: 5 });
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchDocuments(),
                    fetchUserAnalyses(),
                    fetchAnalysisDefinitions()
                ]);
                setLastUpdated(new Date());
            } catch (error) {
                if (error instanceof Error && error.message.includes('authentication')) {
                    logout();
                    router.push('/login');
                }
            }
        };
        loadData();
    }, [isAuthenticated, setFilters, fetchDocuments, fetchUserAnalyses, fetchAnalysisDefinitions, logout, router]);

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

    const handleRefresh = async () => {
        setIsRefreshing(true);
        clearDocError();
        await fetchDocuments(true);
        setLastUpdated(new Date());
        setIsRefreshing(false);
    };

    const error = docError || analysisError;
    const isLoading = docIsLoading || analysisIsLoading;

    return (
        <div className="container pb-8 space-y-6">
            <div className="mb-8">
                <div className="bg-card rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                            <p className="text-muted-foreground">
                                Manage your documents and analysis workflows
                            </p>
                        </div>
                        <div className="flex items-center gap-3 ml-auto">
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                                Last updated: {format(lastUpdated, 'MMM d, yyyy h:mm a')}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="gap-2 h-9 px-3 shadow-sm whitespace-nowrap"
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {error && <ErrorDisplay error={error} />}

            <StatsOverview stats={stats} isLoading={isLoading} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UploadSection
                    onUploadSuccess={handleUploadSuccess}
                    onBatchUpload={handleBatchUpload}
                    onError={handleError}
                />

                <RecentDocuments
                    documents={documents}
                    onDeleteDocument={handleDeleteDocument}
                    isLoading={docIsLoading}
                />

            </div>
            <RecentAnalyses
                analyses={stats.analyses}
                isLoading={analysisIsLoading}
            />
        </div>
    );
} 