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
import { motion } from 'framer-motion';
import {
    DocumentIcon,
    ChartBarIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
    totalDocuments: number;
    analyzedDocuments: number;
    pendingAnalyses: number;
    failedAnalyses: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isAuthenticated, user, logout } = useAuthStore();
    const {
        documents,
        isLoading,
        error,
        fetchDocuments,
        uploadDocument,
        uploadDocuments,
        deleteDocument,
        setFilters,
        clearError
    } = useDocumentStore();

    // Initialize dashboard with recent documents
    useEffect(() => {
        if (isAuthenticated) {
            setFilters({ limit: 5 }); // Show only 5 recent documents
            fetchDocuments().catch((error) => {
                if (error.message.includes('authentication')) {
                    logout();
                    router.push('/login');
                }
            });
        }
    }, [isAuthenticated, setFilters, fetchDocuments, logout, router]);

    // Calculate dashboard stats from documents
    const calculateStats = (): DashboardStats => {
        return documents.reduce((stats, doc) => ({
            totalDocuments: stats.totalDocuments + 1,
            analyzedDocuments: doc.status === 'completed' ? stats.analyzedDocuments + 1 : stats.analyzedDocuments,
            pendingAnalyses: ['pending', 'processing'].includes(doc.status) ? stats.pendingAnalyses + 1 : stats.pendingAnalyses,
            failedAnalyses: doc.status === 'failed' ? stats.failedAnalyses + 1 : stats.failedAnalyses
        }), {
            totalDocuments: 0,
            analyzedDocuments: 0,
            pendingAnalyses: 0,
            failedAnalyses: 0
        });
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
            </div>
        );
    }

    const stats = calculateStats();

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8 space-y-2 max-w-7xl">
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
                            clearError();
                            fetchDocuments();
                        }}
                        className="gap-2"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {error ? (
                <Card className="p-6 mb-8 bg-destructive/10 border-destructive/20">
                    <div className="flex items-center gap-3 text-destructive">
                        <ExclamationCircleIcon className="w-5 h-5" />
                        <p>{error}</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-8 w-full">
                    <StatsOverview stats={stats} />

                    <div className="grid gap-6 md:grid-cols-2 w-full">
                        <Card className="p-6 hover:shadow-lg transition-shadow h-full">
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
                </div>
            )}
        </div>
    );
} 