'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { getSummaryComponent, getResultsComponent, getStepComponent } from '@/components/analysis/registry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2,
    ArrowLeft,
    RefreshCw,
    FileText,
    BarChart4,
    Clock,
    CheckCircle2,
    ChevronLeft,
    Table,
    Layers,
    AlertCircle
} from 'lucide-react';
import { AnalysisStatus } from '@/enums/analysis';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { TableAnalysisStepCode } from '@/enums/analysis';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ANALYSIS_STATUS_COLORS, AnalysisStep, AnalysisDefinitionName, getAnalysisSteps, getAnalysisName, AnalysisDefinitionIcon, getAnalysisIcon } from '@/constants/analysis';
import { StepComponentType } from '@/components/analysis/definitions/base';
import { StepResultResponse } from '@/types/analysis/base';
import { cn } from '@/lib/utils';

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
    const [activeTab, setActiveTab] = useState('summary');
    const [selectedStep, setSelectedStep] = useState<string>(TableAnalysisStepCode.TABLE_DETECTION);
    const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>();
    const [analysisName, setAnalysisName] = useState<AnalysisDefinitionName>();
    const [analysisIcon, setAnalysisIcon] = useState<AnalysisDefinitionIcon>();

    const {
        analyses,
        currentAnalysis,
        analysisType,
        documentId,
        isLoading,
        error,
        fetchAnalysis,
    } = useAnalysisStore();

    const {
        documents,
        fetchDocument,
        currentDocument
    } = useDocumentStore();

    // Check if the current analysis is the same as the one requested in the URL
    useEffect(() => {
        const loadAnalysisData = async () => {
            try {
                // Only fetch if the current analysis doesn't match the requested ID
                // or if the current analysis doesn't have step_results
                if (currentAnalysis?.id !== analysisId) {
                    await fetchAnalysis(analysisId);
                    toast({
                        title: 'Analysis data loaded',
                        description: 'Analysis data loaded successfully',
                        variant: 'default'
                    });
                    setAnalysisSteps(getAnalysisSteps(analysisType));
                    setAnalysisName(getAnalysisName(analysisType));
                    setAnalysisIcon(getAnalysisIcon(analysisType));
                }

                // Check if we need to fetch the document
                if (documentId) {
                    // Check if the document is already in the documents state
                    const documentExists = documents.some(doc => doc.id === documentId);

                    // If the document doesn't exist in the state or if the current document doesn't match
                    if (!documentExists || (currentDocument?.id !== documentId)) {
                        await fetchDocument(documentId);
                        toast({
                            title: 'Document data loaded',
                            description: 'Document data loaded successfully',
                            variant: 'default'
                        });
                    }
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

        loadAnalysisData();
    }, [analysisId, currentAnalysis, fetchAnalysis]);



    const SummaryComponent = getSummaryComponent(analysisType);
    const StepVisualizerComponent = getStepComponent(analysisType, selectedStep, StepComponentType.VISUALIZER);
    const StepEditorComponent = getStepComponent(analysisType, selectedStep, StepComponentType.EDITOR);

    // Loading state
    if (isLoading || !currentAnalysis) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] w-full">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full max-w-3xl space-y-6"
                >
                    {/* Analysis header skeleton */}
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>

                    {/* Analysis summary card skeleton */}
                    <div className="border rounded-lg p-6 space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <div className="grid grid-cols-3 gap-4">
                            <Skeleton className="h-20" />
                            <Skeleton className="h-20" />
                            <Skeleton className="h-20" />
                        </div>
                    </div>

                    {/* Analysis results skeleton */}
                    <div className="border rounded-lg p-6">
                        <Skeleton className="h-6 w-1/4 mb-4" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>

                    <p className="text-sm text-center text-muted-foreground mt-4">
                        Loading analysis data...
                    </p>
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
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md"
                >
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Loading Analysis</AlertTitle>
                        <AlertDescription>
                            {error || "An unexpected error occurred while loading the analysis. Please try again."}
                        </AlertDescription>
                    </Alert>

                    <div className="flex justify-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => fetchAnalysis(analysisId, true)}
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => router.back()}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const getStatusColor = (status: string | undefined) => {
        if (!status) return ANALYSIS_STATUS_COLORS.pending;

        return ANALYSIS_STATUS_COLORS[status as keyof typeof ANALYSIS_STATUS_COLORS] || ANALYSIS_STATUS_COLORS.pending;
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
                            <div dangerouslySetInnerHTML={{ __html: analysisIcon?.icon || '' }} />
                            {analysisName?.name}
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
                        <TabsTrigger value="summary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Summary</TabsTrigger>
                        <TabsTrigger value="results" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Results</TabsTrigger>
                        <TabsTrigger value="steps" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Steps</TabsTrigger>
                        <TabsTrigger value="options" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Options</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="results" className="space-y-6">
                    {/* Step selector */}
                    <Card className="shadow-sm border-gray-200 overflow-hidden">
                        <CardHeader className="pb-3 bg-gray-50/50 border-b">
                            <CardTitle className="text-lg flex items-center">
                                <Layers className="h-5 w-5 mr-2 text-primary" />
                                Analysis Steps
                            </CardTitle>
                            <CardDescription>
                                Select a step to view detailed results and visualizations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-2">
                                {analysisSteps && analysisSteps.map((step) => (
                                    <Button
                                        key={step.step_code}
                                        variant={selectedStep === step.step_code ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedStep(step.step_code)}
                                        className={cn(
                                            "transition-all duration-200 font-medium",
                                            selectedStep === step.step_code
                                                ? "shadow-sm"
                                                : "hover:border-primary/50 hover:bg-primary/5"
                                        )}
                                    >
                                        {step.name}
                                        {currentAnalysis?.step_results.find(s => s.step_code === step.step_code)?.status === 'completed' && (
                                            <CheckCircle2 className="ml-1.5 h-3.5 w-3.5 text-green-500" />
                                        )}
                                    </Button>
                                ))}
                            </div>

                            {selectedStep && (
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Badge variant="outline" className="mr-2 bg-primary/5">
                                                {analysisSteps?.find(s => s.step_code === selectedStep)?.name}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {currentAnalysis?.step_results.find(s => s.step_code === selectedStep)?.status === 'completed'
                                                    ? 'Completed'
                                                    : 'In progress'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {currentAnalysis?.step_results.find(s => s.step_code === selectedStep)?.algorithm_code}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Results component */}

                    {StepVisualizerComponent && (
                        <StepVisualizerComponent
                            documentId={documentId}
                            analysisId={analysisId}
                            analysisType={analysisType}
                            step={analysisSteps?.find(step => step.step_code === selectedStep) as AnalysisStep}
                            stepResult={currentAnalysis?.step_results.find(step => step.step_code === selectedStep) as StepResultResponse}
                        />
                    )}
                    {/* <ResultsComponent
                        analysisId={analysisId}
                        analysisType={analysisType}
                        stepCode={selectedStep}
                        documentId={documentId}
                        pageNumber={1}
                        showControls={true}
                        stepResult={currentAnalysis?.step_results.find(step => step.step_code === selectedStep) as StepResultResponse}
                        onExport={(format) => {
                            toast({
                                title: "Export Initiated",
                                description: `Exporting results as ${format}`,
                            });
                        }}
                    /> */}
                </TabsContent>

                <TabsContent value="steps" className="space-y-6">
                    {StepEditorComponent && (
                        <StepEditorComponent
                            documentId={documentId}
                            analysisId={analysisId}
                            analysisType={analysisType}
                            step={analysisSteps?.find(step => step.step_code === selectedStep) as AnalysisStep}
                            stepResult={currentAnalysis?.step_results.find(step => step.step_code === selectedStep) as StepResultResponse}
                        />
                    )}
                </TabsContent>

                <TabsContent value="options" className="space-y-6">
                    {/* {OptionsComponent && (
                        <OptionsComponent
                            analysisId={analysisId}
                            documentId={documentId}
                        />
                    )} */}
                </TabsContent>

                <TabsContent value="summary" className="space-y-6">
                    <SummaryComponent
                        analysisId={analysisId}
                        analysisType={analysisType}
                        stepCode="extract"
                        documentId={documentId}
                        status={currentAnalysis?.status}
                        metadata={{
                            documentName: currentDocument?.name || 'Unknown',
                            documentType: currentDocument?.type || 'Unknown'
                        }}
                    />
                </TabsContent>
            </Tabs>
        </motion.div>
    );
} 