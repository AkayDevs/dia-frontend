'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Document } from '@/types/document';
import { AnalysisType, AnalysisStatus } from '@/types/analysis';
import { motion } from 'framer-motion';
import { use } from 'react';
import {
    FileText,
    AlertTriangle,
    ArrowLeft,
    Table as TableIcon,
    FileSearch,
    FileStack,
    Download,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    Settings,
    Edit
} from 'lucide-react';
import {
    TableEditor,
    TextEditor,
    SummaryEditor,
    TemplateEditor
} from '@/components/analysis/editors';

interface ResultsPageProps {
    params: Promise<{
        documentId: string;
        analysisId: string;
    }>;
}

// Analysis type icon mapping
const AnalysisTypeIcon = ({ type, className = "h-5 w-5" }: { type: AnalysisType; className?: string }) => {
    const icons = {
        [AnalysisType.TABLE_DETECTION]: <TableIcon className={className} />,
        [AnalysisType.TEXT_EXTRACTION]: <FileText className={className} />,
        [AnalysisType.TEXT_SUMMARIZATION]: <FileSearch className={className} />,
        [AnalysisType.TEMPLATE_CONVERSION]: <FileStack className={className} />
    };
    return icons[type] || <FileText className={className} />;
};

export default function ResultsPage({ params }: ResultsPageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('results');

    // Unwrap params
    const { documentId, analysisId } = use(params);

    const {
        documents,
        isLoading: isLoadingDocs,
        fetchDocuments
    } = useDocumentStore();

    const {
        analyses,
        isLoading: isLoadingAnalysis,
        fetchAnalyses,
        retryAnalysis
    } = useAnalysisStore();

    // Get the current document and analysis
    const document = documents.find(doc => doc.id === documentId);
    const analysis = analyses.find(a => a.id === analysisId);

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchDocuments(),
                    fetchAnalyses()
                ]);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load data",
                    variant: "destructive",
                });
                router.push('/dashboard/documents');
            }
        };

        loadData();
    }, [fetchDocuments, fetchAnalyses, router, toast]);

    const handleRetry = async () => {
        try {
            await retryAnalysis(analysisId);
            toast({
                description: "Analysis retry started",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to retry analysis",
                variant: "destructive",
            });
        }
    };

    const handleExport = () => {
        // TODO: Implement export functionality
        toast({
            description: "Export functionality coming soon",
            duration: 3000,
        });
    };

    if (isLoadingDocs || isLoadingAnalysis) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!document || !analysis) {
        return (
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Analysis not found. Please try again or contact support if the issue persists.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto p-6 max-w-7xl space-y-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <div className="flex gap-2">
                    {analysis.status === AnalysisStatus.FAILED && (
                        <Button
                            variant="outline"
                            onClick={handleRetry}
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry Analysis
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export Results
                    </Button>
                </div>
            </div>

            {/* Analysis Info Card */}
            <Card>
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <AnalysisTypeIcon type={analysis.type} className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{document.name}</CardTitle>
                                <CardDescription>
                                    Analysis started {new Date(analysis.created_at).toLocaleString()}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-base">
                                {document.type.toUpperCase()}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={
                                    analysis.status === AnalysisStatus.COMPLETED
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : analysis.status === AnalysisStatus.FAILED
                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }
                            >
                                {analysis.status === AnalysisStatus.COMPLETED ? (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                ) : analysis.status === AnalysisStatus.FAILED ? (
                                    <XCircle className="h-4 w-4 mr-2" />
                                ) : (
                                    <Clock className="h-4 w-4 mr-2" />
                                )}
                                {analysis.status}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Results Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="results" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Results
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="space-y-4">
                    {analysis.status === AnalysisStatus.COMPLETED ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Edit className="h-5 w-5 text-primary" />
                                    Analysis Results
                                </CardTitle>
                                <CardDescription>
                                    Review and edit the analysis results
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {analysis.type === AnalysisType.TABLE_DETECTION && (
                                    <TableEditor
                                        analysis={analysis}
                                        onSave={async (updatedResults) => {
                                            // TODO: Implement save functionality
                                            toast({
                                                description: "Save functionality coming soon",
                                                duration: 3000,
                                            });
                                        }}
                                    />
                                )}
                                {analysis.type === AnalysisType.TEXT_EXTRACTION && (
                                    <TextEditor
                                        analysis={analysis}
                                        onSave={async (updatedResults) => {
                                            // TODO: Implement save functionality
                                            toast({
                                                description: "Save functionality coming soon",
                                                duration: 3000,
                                            });
                                        }}
                                    />
                                )}
                                {analysis.type === AnalysisType.TEXT_SUMMARIZATION && (
                                    <SummaryEditor
                                        analysis={analysis}
                                        onSave={async (updatedResults) => {
                                            // TODO: Implement save functionality
                                            toast({
                                                description: "Save functionality coming soon",
                                                duration: 3000,
                                            });
                                        }}
                                    />
                                )}
                                {analysis.type === AnalysisType.TEMPLATE_CONVERSION && (
                                    <TemplateEditor
                                        analysis={analysis}
                                        onSave={async (updatedResults) => {
                                            // TODO: Implement save functionality
                                            toast({
                                                description: "Save functionality coming soon",
                                                duration: 3000,
                                            });
                                        }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    ) : analysis.status === AnalysisStatus.FAILED ? (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Analysis Failed</AlertTitle>
                            <AlertDescription>
                                The analysis failed to complete. Please try again or contact support if the issue persists.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-center gap-4">
                                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                                    <p>Analysis in progress...</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" />
                                Analysis Settings
                            </CardTitle>
                            <CardDescription>
                                View and modify analysis parameters
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Parameters Used</h4>
                                    <ScrollArea className="h-[200px]">
                                        <pre className="p-4 rounded-lg bg-muted font-mono text-sm">
                                            {JSON.stringify(analysis.parameters, null, 2)}
                                        </pre>
                                    </ScrollArea>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
} 