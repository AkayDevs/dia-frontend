'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import {
    Loader2,
    ArrowLeft,
    RefreshCw,
    FileText,
    BarChart4,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { getAnalysisComponent } from '@/components/analysis/registry';
import { AnalysisStatus } from '@/enums/analysis';
import { formatDistanceToNow } from 'date-fns';
import { AnalysisTypeIcon } from '@/components/analysis';
import {
    StepperProps,
    ResultsProps,
    OptionsProps,
    SummaryProps
} from '@/components/analysis/interfaces';
import { motion } from 'framer-motion';

interface AnalysisDetailPageProps {
    params: {
        analysisId: string;
    };
}

export default function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
    // Unwrap params using React.use()
    const unwrappedParams = React.use(params as unknown as Promise<{ analysisId: string }>);
    const { analysisId } = unwrappedParams;

    const router = useRouter();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('results');

    const {
        currentAnalysis,
        analysisType,
        documentId,
        isLoading,
        error,
        fetchAnalysis,
    } = useAnalysisStore();

    const {
        currentDocument,
        fetchDocument,
    } = useDocumentStore();

    // Load analysis and document data
    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchAnalysis(analysisId);
                if (documentId) {
                    await fetchDocument(documentId);
                }
            } catch (error) {
                console.error('Error loading analysis data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load analysis data',
                    variant: 'destructive'
                });
            }
        };

        loadData();
    }, [analysisId, fetchAnalysis, documentId, fetchDocument, toast]);

    // Get components from registry based on analysis type
    const StepperComponent = analysisType ? getAnalysisComponent(analysisType, 'Stepper') as React.ComponentType<StepperProps> : null;
    const ResultsComponent = analysisType ? getAnalysisComponent(analysisType, 'Results') as React.ComponentType<ResultsProps> : null;
    const OptionsComponent = analysisType ? getAnalysisComponent(analysisType, 'Options') as React.ComponentType<OptionsProps> : null;
    const SummaryComponent = analysisType ? getAnalysisComponent(analysisType, 'Summary') as React.ComponentType<SummaryProps> : null;

    // Loading state
    if (isLoading || !currentAnalysis) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BarChart4 className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <p className="text-lg font-medium">Loading analysis data</p>
                    <p className="text-sm text-muted-foreground">Please wait while we prepare your analysis</p>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h2 className="text-xl font-semibold mb-2">Error Loading Analysis</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button
                        variant="outline"
                        onClick={() => fetchAnalysis(analysisId)}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                    </Button>
                </motion.div>
            </div>
        );
    }

    // Get status badge color
    const getStatusColor = (status: string | undefined) => {
        if (!status) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

        switch (status) {
            case AnalysisStatus.COMPLETED:
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case AnalysisStatus.IN_PROGRESS:
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case AnalysisStatus.FAILED:
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pb-10"
        >
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-8 w-8"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <AnalysisTypeIcon type={analysisType} className="h-6 w-6 text-primary" />
                            {analysisType === 'table_analysis' ? 'Table Analysis' :
                                analysisType === 'text_analysis' ? 'Text Analysis' : 'Analysis'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                            Started {formatDistanceToNow(new Date(currentAnalysis.created_at), { addSuffix: true })}
                            {currentAnalysis.completed_at && (
                                <> • Completed {formatDistanceToNow(new Date(currentAnalysis.completed_at), { addSuffix: true })}</>
                            )}
                        </p>
                        <Badge variant="outline" className={`${getStatusColor(currentAnalysis.status)}`}>
                            {currentAnalysis.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/documents/${documentId}`)}
                        className="gap-1"
                    >
                        <FileText className="h-4 w-4" />
                        View Document
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAnalysis(analysisId)}
                        className="gap-1"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Analysis Overview */}
            <div className="border rounded-lg bg-card/50">
                <div className="flex items-center p-3 border-b">
                    <BarChart4 className="h-5 w-5 text-muted-foreground mr-2" />
                    <h3 className="text-sm font-medium">Analysis Overview</h3>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Document Info */}
                        {currentDocument && (
                            <div className="space-y-1">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4 mr-1.5 text-blue-500/70" />
                                    <span>Document</span>
                                </div>
                                <p className="font-medium">{currentDocument.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    Type: {currentDocument.type.toString().toUpperCase()}
                                </p>
                            </div>
                        )}

                        {/* Analysis Status */}
                        <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500/70" />
                                <span>Status</span>
                            </div>
                            <p className="font-medium capitalize">{currentAnalysis.status?.toLowerCase() || 'unknown'}</p>
                            <p className="text-xs text-muted-foreground">
                                Analysis ID: {currentAnalysis.id}
                            </p>
                        </div>

                        {/* Timing Info */}
                        <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-1.5 text-amber-500/70" />
                                <span>Timing</span>
                            </div>
                            <p className="font-medium">
                                {currentAnalysis.completed_at ?
                                    `${Math.round((new Date(currentAnalysis.completed_at).getTime() - new Date(currentAnalysis.created_at).getTime()) / 1000)} seconds` :
                                    'In progress'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {currentAnalysis.completed_at ? 'Total processing time' : 'Processing time so far'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="bg-card rounded-lg shadow-sm border p-1">
                    <TabsList className="w-full grid grid-cols-4">
                        <TabsTrigger value="results" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Results</TabsTrigger>
                        <TabsTrigger value="steps" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Steps</TabsTrigger>
                        <TabsTrigger value="options" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Options</TabsTrigger>
                        <TabsTrigger value="summary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Summary</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="results" className="space-y-6">
                    {ResultsComponent && (
                        <ResultsComponent
                            analysisId={analysisId}
                            documentId={documentId}
                        />
                    )}
                </TabsContent>

                <TabsContent value="steps" className="space-y-6">
                    {StepperComponent && (
                        <StepperComponent
                            analysisId={analysisId}
                            documentId={documentId}
                        />
                    )}
                </TabsContent>

                <TabsContent value="options" className="space-y-6">
                    {OptionsComponent && (
                        <OptionsComponent
                            analysisId={analysisId}
                            documentId={documentId}
                        />
                    )}
                </TabsContent>

                <TabsContent value="summary" className="space-y-6">
                    {SummaryComponent && (
                        <SummaryComponent
                            analysisId={analysisId}
                            documentId={documentId}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </motion.div>
    );
} 