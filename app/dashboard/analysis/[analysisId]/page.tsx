'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { getSummaryComponent, getStepComponent } from '@/components/analysis/registry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    RefreshCw,
    FileText,
    BarChart4,
    Clock,
    CheckCircle2,
    Layers,
    AlertCircle,
    Edit,
    Pencil
} from 'lucide-react';
import { AnalysisStatus } from '@/enums/analysis';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { TableAnalysisStepCode } from '@/enums/analysis';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnalysisStep, AnalysisDefinitionName, getAnalysisSteps, getAnalysisName, AnalysisDefinitionIcon, getAnalysisIcon } from '@/constants/analysis';
import { StepComponentType } from '@/components/analysis/definitions/base';
import { StepResultResponse } from '@/types/analysis/base';
import { cn } from '@/lib/utils';
import { DOCUMENT_TYPE_ICONS, ANALYSIS_STATUS_ICONS } from '@/constants/icons';

type PageProps = {
    params: { [key: string]: string };
    searchParams?: { [key: string]: string | string[] | undefined };
};

interface AnalysisDetailPageProps extends PageProps {
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
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
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
            <div className="border rounded-lg bg-card/50 shadow-sm overflow-hidden">
                <div className="flex items-center p-3 border-b bg-muted/20">
                    <BarChart4 className="h-4 w-4 text-primary/70 mr-2" />
                    <h3 className="text-sm font-medium text-primary/90">Analysis Overview</h3>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Document Info */}
                        {currentDocument && (
                            <div className="space-y-1.5 p-3 bg-card/30 rounded-md border border-border/30 transition-all hover:border-border/50 hover:shadow-sm">
                                <div className="flex items-center text-xs font-medium text-muted-foreground">
                                    <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-500/80" />
                                    <span>Document</span>
                                </div>
                                <p className="text-sm font-medium truncate" title={currentDocument.name}>
                                    {currentDocument.name}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] bg-secondary/10 border-secondary/20 px-1.5 py-0.5">
                                        {DOCUMENT_TYPE_ICONS[currentDocument.type as keyof typeof DOCUMENT_TYPE_ICONS]}
                                        <span className="ml-1">{currentDocument.type.toString().toUpperCase()}</span>
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground">
                                        ID: {currentDocument.id.substring(0, 8)}...
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Analysis Status */}
                        <div className="space-y-1.5 p-3 bg-card/30 rounded-md border border-border/30 transition-all hover:border-border/50 hover:shadow-sm">
                            <div className="flex items-center text-xs font-medium text-muted-foreground">
                                {ANALYSIS_STATUS_ICONS[currentAnalysis.status as keyof typeof ANALYSIS_STATUS_ICONS]}
                                <span className="ml-1.5">Status</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium capitalize">
                                    {currentAnalysis.status?.toLowerCase() || 'unknown'}
                                </p>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] px-1.5 py-0.5",
                                        currentAnalysis.status === AnalysisStatus.COMPLETED ? "bg-green-500/10 text-green-600 border-green-200" :
                                            currentAnalysis.status === AnalysisStatus.IN_PROGRESS ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                                                currentAnalysis.status === AnalysisStatus.FAILED ? "bg-red-500/10 text-red-600 border-red-200" :
                                                    "bg-secondary/10 border-secondary/20"
                                    )}
                                >
                                    {currentAnalysis.step_results?.length || 0} steps
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">
                                    Started {formatDistanceToNow(new Date(currentAnalysis.created_at), { addSuffix: true })}
                                </span>
                                {currentAnalysis.completed_at && (
                                    <span className="text-[10px] text-muted-foreground">
                                        Completed {formatDistanceToNow(new Date(currentAnalysis.completed_at), { addSuffix: true })}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Timing Info */}
                        <div className="space-y-1.5 p-3 bg-card/30 rounded-md border border-border/30 transition-all hover:border-border/50 hover:shadow-sm">
                            <div className="flex items-center text-xs font-medium text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500/80" />
                                <span>Processing Time</span>
                            </div>
                            <p className="text-sm font-medium">
                                {currentAnalysis.completed_at ?
                                    `${Math.round((new Date(currentAnalysis.completed_at).getTime() - new Date(currentAnalysis.created_at).getTime()) / 1000)} seconds` :
                                    'In progress'}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">
                                    {currentAnalysis.completed_at ? 'Total processing time' : 'Processing time so far'}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground"
                                    onClick={() => fetchAnalysis(analysisId, true)}
                                    disabled={isLoading}
                                >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Refresh
                                </Button>
                            </div>
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
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm text-muted-foreground">
                                                {currentAnalysis?.step_results.find(s => s.step_code === selectedStep)?.algorithm_code}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Results component */}

                    {StepVisualizerComponent && (
                        <>
                            <div className="flex justify-end mb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveTab('steps')}
                                    className="gap-2 text-sm"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit Results
                                </Button>
                            </div>
                            <StepVisualizerComponent
                                documentId={documentId}
                                analysisId={analysisId}
                                analysisType={analysisType}
                                step={analysisSteps?.find(step => step.step_code === selectedStep) as AnalysisStep}
                                stepResult={currentAnalysis?.step_results.find(step => step.step_code === selectedStep) as StepResultResponse}
                            />
                        </>
                    )}
                </TabsContent>

                <TabsContent value="steps" className="space-y-6">
                    <Card className="shadow-sm border-gray-200 overflow-hidden">
                        <CardHeader className="pb-3 bg-gray-50/50 border-b">
                            <CardTitle className="text-lg flex items-center">
                                <Pencil className="h-5 w-5 mr-2 text-primary" />
                                Edit Analysis Results
                            </CardTitle>
                            <CardDescription>
                                Make corrections to the analysis results for the selected step
                            </CardDescription>
                            <div className="absolute top-3 right-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveTab('results')}
                                    className="gap-1 text-xs h-7 px-2"
                                >
                                    <BarChart4 className="h-3.5 w-3.5 mr-1" />
                                    Back to Results
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

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
                </TabsContent>

                <TabsContent value="summary" className="space-y-6">
                    <SummaryComponent
                        analysisId={analysisId}
                        analysisType={analysisType}
                        stepCode="extract"
                        analysisRun={currentAnalysis}
                    />
                </TabsContent>
            </Tabs>
        </motion.div>
    );
} 