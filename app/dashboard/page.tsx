'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/ui/file-upload';
import { DocumentList } from '@/components/documents/document-list';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDocumentStore } from '@/store/useDocumentStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart,
    FileText,
    Clock,
    CheckCircle,
    Upload,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { Document } from '@/types/document';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    trend?: {
        value: number;
        label: string;
        timeframe: string;
    };
    isLoading?: boolean;
}

function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    isLoading = false
}: StatsCardProps) {
    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-6 w-[60px]" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-semibold">{value}</h3>
                            {trend && (
                                <Badge variant={trend.value >= 0 ? "default" : "destructive"} className="text-xs">
                                    {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
                                </Badge>
                            )}
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { documents, setDocuments } = useDocumentStore();
    const [isLoading, setIsLoading] = useState(true);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [historicalStats, setHistoricalStats] = useState<{
        lastMonth: number;
        lastWeek: number;
    }>({
        lastMonth: 0,
        lastWeek: 0
    });

    const calculateStats = () => {
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const lastMonthDocs = documents.filter(doc => new Date(doc.uploadedAt) > oneMonthAgo).length;
        const lastWeekDocs = documents.filter(doc => new Date(doc.uploadedAt) > oneWeekAgo).length;

        setHistoricalStats({
            lastMonth: lastMonthDocs,
            lastWeek: lastWeekDocs
        });
    };

    const stats = {
        total: {
            value: documents.length,
            trend: documents.length > 0 ? {
                value: Math.round((historicalStats.lastMonth / documents.length) * 100 - 100),
                label: 'vs last month',
                timeframe: '30d'
            } : undefined
        },
        processing: {
            value: documents.filter(d => d.status === 'processing').length,
            description: "Documents currently being analyzed"
        },
        completed: {
            value: documents.filter(d => d.status === 'completed').length,
            trend: historicalStats.lastWeek > 0 ? {
                value: Math.round((documents.filter(d =>
                    d.status === 'completed' &&
                    new Date(d.uploadedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length / historicalStats.lastWeek) * 100 - 100),
                label: 'this week',
                timeframe: '7d'
            } : undefined
        },
        analyzed: {
            value: documents.reduce((acc, doc) => doc.status === 'completed' ? acc + 1 : acc, 0),
            description: "Successfully analyzed documents",
            trend: historicalStats.lastMonth > 0 ? {
                value: Math.round((documents.filter(d =>
                    d.status === 'completed' &&
                    new Date(d.uploadedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length / historicalStats.lastMonth) * 100 - 100),
                label: 'vs last month',
                timeframe: '30d'
            } : undefined
        }
    };

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/documents/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch documents');
            }

            const data = await response.json();
            setDocuments(data);
            calculateStats();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch documents. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUploadSuccess = async (document: Document) => {
        setUploadError(null);
        toast({
            description: "Document uploaded successfully!",
            duration: 3000,
        });
        await fetchDocuments(); // Refresh the document list
        router.push(`/dashboard/analysis/${document.id}`);
    };

    const handleUploadError = (error: Error) => {
        setUploadError(error.message);
        toast({
            title: "Upload Failed",
            description: error.message,
            variant: "destructive",
            duration: 5000,
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground mt-2">
                            Upload and analyze your documents
                        </p>
                    </div>
                    <Button
                        onClick={fetchDocuments}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            title="Total Documents"
                            value={stats.total.value}
                            icon={FileText}
                            isLoading={isLoading}
                            trend={stats.total.trend}
                        />
                        <StatsCard
                            title="Processing"
                            value={stats.processing.value}
                            icon={Clock}
                            isLoading={isLoading}
                            description={stats.processing.description}
                        />
                        <StatsCard
                            title="Completed"
                            value={stats.completed.value}
                            icon={CheckCircle}
                            isLoading={isLoading}
                            trend={stats.completed.trend}
                        />
                        <StatsCard
                            title="Total Analyzed"
                            value={stats.analyzed.value}
                            icon={BarChart}
                            isLoading={isLoading}
                            description={stats.analyzed.description}
                            trend={stats.analyzed.trend}
                        />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Upload Document
                            </CardTitle>
                            <CardDescription>
                                Upload your documents for analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnimatePresence>
                                {uploadError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Alert variant="destructive" className="mb-4">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{uploadError}</AlertDescription>
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <FileUpload
                                onUploadSuccess={handleUploadSuccess}
                                onUploadError={handleUploadError}
                                className="h-[300px]"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Recent Documents
                            </CardTitle>
                            <CardDescription>
                                Your recently uploaded documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px] pr-4">
                                <DocumentList />
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
} 