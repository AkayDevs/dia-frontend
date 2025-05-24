'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { analysisService } from '@/services/analysis.service';
import { AnalysisStatus, AnalysisMode } from '@/enums/analysis';
import { AnalysisRunWithResults, AnalysisRunWithResultsInfo } from '@/types/analysis/base';
import { Document } from '@/types/document';
import {
    HistoryHeader,
    HistoryFilters,
    HistoryList,
    DeleteAnalysisDialog
} from '@/components/history';

export default function HistoryPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { logout } = useAuthStore();

    // Get state from stores
    const {
        fetchUserAnalyses,
        startAnalysis,
        fetchAnalysis,
        analyses: analysesRecord
    } = useAnalysisStore();

    const {
        fetchDocument,
        deleteDocument,
        documents: documentsArray
    } = useDocumentStore();

    // Local state
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<AnalysisStatus | 'ALL'>('ALL');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRunWithResults | AnalysisRunWithResultsInfo | null>(null);

    // Convert documents array to a record for easier lookup
    const documents: Record<string, Document> = {};
    documentsArray.forEach(doc => {
        documents[doc.id] = doc;
    });

    // Convert analyses record to an array
    const analyses = Object.values(analysesRecord);

    // Fetch analyses on component mount
    useEffect(() => {
        fetchAnalyses();
    }, []);

    // Fetch documents for each analysis
    useEffect(() => {
        const fetchDocumentsForAnalyses = async () => {
            const documentIds = analyses.map(analysis => analysis.document_id);
            const uniqueDocumentIds = [...new Set(documentIds)];

            for (const docId of uniqueDocumentIds) {
                if (!documents[docId]) {
                    try {
                        await fetchDocument(docId);
                    } catch (error) {
                        console.error(`Failed to fetch document ${docId}:`, error);
                    }
                }
            }
        };

        if (analyses.length > 0) {
            fetchDocumentsForAnalyses();
        }
    }, [analyses]);

    // Fetch analyses with error handling
    const fetchAnalyses = async () => {
        setIsLoading(true);
        setIsRefreshing(true);

        try {
            await fetchUserAnalyses({
                status: statusFilter === 'ALL' ? undefined : statusFilter
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch analysis history';

            // Handle authentication errors
            if (message.includes('Could not validate credentials') ||
                message.includes('No authentication token found')) {
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
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Handle viewing analysis results
    const handleViewResults = useCallback((analysis: AnalysisRunWithResults | AnalysisRunWithResultsInfo) => {
        router.push(`/dashboard/analysis/${analysis.document_id}/${analysis.id}/results`);
    }, [router]);

    // Handle exporting analysis results
    const handleExportResults = useCallback(async (analysis: AnalysisRunWithResults | AnalysisRunWithResultsInfo) => {
        try {
            await analysisService.downloadExport(analysis.id as string, 'json');

            toast({
                description: "Results exported successfully",
                duration: 3000,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to export results';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    }, [toast]);

    // Handle rerunning an analysis
    const handleRerunAnalysis = useCallback(async (analysis: AnalysisRunWithResults | AnalysisRunWithResultsInfo) => {
        try {
            // Get the full analysis details if we only have the info
            const fullAnalysis = 'step_results' in analysis && analysis.step_results.length > 0
                ? analysis
                : await fetchAnalysis(analysis.id as string);

            // Start a new analysis with the same configuration
            await startAnalysis(
                analysis.document_id,
                analysis.analysis_code,
                analysis.mode as AnalysisMode,
                analysis.config
            );

            toast({
                description: "Analysis restarted successfully",
                duration: 3000,
            });

            // Refresh the list
            fetchAnalyses();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to rerun analysis';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    }, [fetchAnalysis, startAnalysis, toast, fetchAnalyses]);

    // Handle deleting an analysis
    const handleDeleteAnalysis = useCallback((analysis: AnalysisRunWithResults | AnalysisRunWithResultsInfo) => {
        setSelectedAnalysis(analysis);
        setDeleteDialogOpen(true);
    }, []);

    // Confirm deletion
    const confirmDelete = useCallback(async () => {
        if (!selectedAnalysis) return;

        setIsDeleting(true);
        try {
            await deleteDocument(selectedAnalysis.document_id);

            toast({
                description: "Analysis and associated document deleted successfully",
                duration: 3000,
            });

            fetchAnalyses();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete analysis';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedAnalysis(null);
            setIsDeleting(false);
        }
    }, [selectedAnalysis, deleteDocument, toast, fetchAnalyses]);

    // Handle starting a new analysis
    const handleStartNewAnalysis = useCallback(() => {
        router.push('/dashboard/analysis');
    }, [router]);

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-8">
            <HistoryHeader
                onRefresh={fetchAnalyses}
                isRefreshing={isRefreshing}
            />

            <HistoryFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
            />

            <HistoryList
                analyses={analyses}
                documents={documents}
                isLoading={isLoading}
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                onViewResults={handleViewResults}
                onExportResults={handleExportResults}
                onRerunAnalysis={handleRerunAnalysis}
                onDeleteAnalysis={handleDeleteAnalysis}
                onStartNewAnalysis={handleStartNewAnalysis}
            />

            <DeleteAnalysisDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                selectedAnalysis={selectedAnalysis}
                onConfirmDelete={confirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
} 