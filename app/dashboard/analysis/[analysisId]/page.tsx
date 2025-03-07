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
import { Loader2, ArrowLeft } from 'lucide-react';
import { getAnalysisComponent } from '@/components/analysis/registry';
import { AnalysisStatus } from '@/enums/analysis';
import { formatDistanceToNow } from 'date-fns';
import { AnalysisTypeIcon } from '@/components/analysis';

interface AnalysisDetailPageProps {
    params: {
        analysisId: string;
    };
}

export default function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
    const { analysisId } = params;
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
    const StepperComponent = analysisType ? getAnalysisComponent(analysisType, 'Stepper') : null;
    const ResultsComponent = analysisType ? getAnalysisComponent(analysisType, 'Results') : null;
    const OptionsComponent = analysisType ? getAnalysisComponent(analysisType, 'Options') : null;
    const SummaryComponent = analysisType ? getAnalysisComponent(analysisType, 'Summary') : null;

    // Loading state
    if (isLoading || !currentAnalysis) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading analysis data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h2 className="text-lg font-semibold">Error Loading Analysis</h2>
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={() => fetchAnalysis(analysisId)}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
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
                        <div className={`px-2 py-0.5 text-xs rounded-full ${currentAnalysis.status === AnalysisStatus.COMPLETED ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                currentAnalysis.status === AnalysisStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    currentAnalysis.status === AnalysisStatus.FAILED ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                            {currentAnalysis.status}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/documents/${documentId}`)}
                    >
                        View Document
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAnalysis(analysisId)}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Document Info */}
            {currentDocument && (
                <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Document</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{currentDocument.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Type: {currentDocument.type.toString().toUpperCase()}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/dashboard/documents/${documentId}`)}
                            >
                                View Details
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="results">Results</TabsTrigger>
                    <TabsTrigger value="steps">Steps</TabsTrigger>
                    <TabsTrigger value="options">Options</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>

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
        </div>
    );
} 