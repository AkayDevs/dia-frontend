'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DocumentList } from '@/components/documents/document-list';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { UploadHandler } from '@/components/ui/upload-handler';
import { documentService, Document, UserStats } from '@/services/document.service';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { DocumentIcon, ChartBarIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isAuthenticated, token, logout } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [docsData, statsData] = await Promise.all([
                    documentService.getDocuments({ limit: 10 }),
                    documentService.getUserStats()
                ]);

                setDocuments(docsData);
                setStats(statsData);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to load dashboard data';

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

                setError(message);
                toast({
                    title: "Error",
                    description: message,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && token) {
            fetchData();
        }
    }, [isAuthenticated, token, router, toast, logout]);

    const handleUploadSuccess = async (document: Document) => {
        setDocuments(prev => [document, ...prev]);
        if (stats) {
            setStats({
                ...stats,
                total_documents: stats.total_documents + 1
            });
        }
        toast({
            description: "Document uploaded successfully",
            duration: 3000,
        });
    };

    const handleUploadError = (error: Error) => {
        // Handle authentication errors during upload
        if (error.message.includes('Could not validate credentials') ||
            error.message.includes('No authentication token found')) {
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
            title: "Upload Failed",
            description: error.message,
            variant: "destructive",
        });
    };

    const handleDeleteDocument = async (documentId: string) => {
        try {
            await documentService.deleteDocument(documentId);
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            if (stats) {
                setStats({
                    ...stats,
                    total_documents: stats.total_documents - 1
                });
            }
            toast({
                description: "Document deleted successfully",
                duration: 3000,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete document';

            // Handle authentication errors during deletion
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
        }
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

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8 space-y-2 max-w-7xl">
                <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-lg text-muted-foreground">Manage and analyze your documents efficiently</p>
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
                    {stats && <StatsOverview stats={stats} />}

                    <div className="grid gap-6 md:grid-cols-2 w-full">
                        <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <DocumentIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-semibold">Upload Document</h3>
                                    <p className="text-sm text-muted-foreground">Add a new document for analysis</p>
                                </div>
                            </div>
                            <UploadHandler
                                onSuccess={handleUploadSuccess}
                                onError={handleUploadError}
                                className="h-[200px]"
                            />
                        </Card>

                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <ChartBarIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-semibold">Quick Analysis</h3>
                                    <p className="text-sm text-muted-foreground">Start analyzing your documents</p>
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() => router.push('/dashboard/analysis')}
                            >
                                Start Analysis
                            </Button>
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
                        />
                    </div>
                </div>
            )}
        </div>
    );
} 