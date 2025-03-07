'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useToast } from '@/hooks/use-toast';
import { AnalysisMode, AnalysisStatus } from '@/enums/analysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, FileText, ChevronRight } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { AnalysisTypeIcon } from '@/components/analysis';
import { DocumentTypeIcon } from '@/components/documents';

interface DocumentAnalysisPageProps {
    params: {
        id: string;
    };
}

export default function DocumentAnalysisPage({ params }: DocumentAnalysisPageProps) {
    const { id } = params;
    const router = useRouter();
    const { toast } = useToast();
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<string | null>(null);
    const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);

    const {
        currentDocument,
        isLoading: isLoadingDocument,
        error: documentError,
        fetchDocument,
    } = useDocumentStore();

    const {
        analysisDefinitions,
        analyses,
        isLoading: isLoadingAnalyses,
        error: analysisError,
        fetchAnalysisDefinitions,
        fetchDocumentAnalyses,
        startAnalysis,
    } = useAnalysisStore();

    // Load document and analysis data
    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchDocument(id),
                    fetchAnalysisDefinitions(),
                    fetchDocumentAnalyses(id)
                ]);
            } catch (error) {
                console.error('Error loading document analysis data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load document data',
                    variant: 'destructive'
                });
            }
        };

        loadData();
    }, [id, fetchDocument, fetchAnalysisDefinitions, fetchDocumentAnalyses, toast]);

    // Handle starting a new analysis
    const handleStartAnalysis = async () => {
        if (!selectedAnalysisType) {
            toast({
                title: 'Error',
                description: 'Please select an analysis type',
                variant: 'destructive'
            });
            return;
        }

        setIsStartingAnalysis(true);
        try {
            // Get the analysis definition code
            const selectedDefinition = analysisDefinitions.find(def => def.id === selectedAnalysisType);
            if (!selectedDefinition) {
                throw new Error("Selected analysis type not found");
            }

            // Call startAnalysis with the correct parameters
            const result = await startAnalysis(
                id,
                selectedDefinition.code,
                AnalysisMode.AUTOMATIC
            );

            toast({
                description: 'Analysis started successfully',
            });

            // Navigate to the analysis detail page
            router.push(`/dashboard/analysis/${result.id}`);
        } catch (error) {
            console.error('Error starting analysis:', error);
            toast({
                title: 'Error',
                description: 'Failed to start analysis',
                variant: 'destructive'
            });
        } finally {
            setIsStartingAnalysis(false);
        }
    };

    // Filter analysis definitions compatible with this document
    const compatibleAnalysisTypes = currentDocument
        ? analysisDefinitions.filter(def =>
            def.supported_document_types.includes(currentDocument.type)
        )
        : [];

    // Get document analyses
    const documentAnalyses = analyses.filter(analysis => analysis.document_id === id);

    // Loading state
    const isLoading = isLoadingDocument || isLoadingAnalyses || isStartingAnalysis;
    if (isLoading && !currentDocument) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading document data...</p>
                </div>
            </div>
        );
    }

    // Error state
    const error = documentError || analysisError;
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h2 className="text-lg font-semibold">Error Loading Document</h2>
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={() => fetchDocument(id)}>
                    Retry
                </Button>
            </div>
        );
    }

    // Not found state
    if (!currentDocument) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <FileText className="w-12 h-12 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Document Not Found</h2>
                <p className="text-muted-foreground">The document you're looking for doesn't exist or has been deleted.</p>
                <Button variant="outline" onClick={() => router.push('/dashboard/documents')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Documents
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
                            <DocumentTypeIcon type={currentDocument.type} className="h-6 w-6 text-primary" />
                            {currentDocument.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                            Uploaded {formatDistanceToNow(new Date(currentDocument.uploaded_at), { addSuffix: true })}
                            {currentDocument.updated_at && (
                                <> • Updated {formatDistanceToNow(new Date(currentDocument.updated_at), { addSuffix: true })}</>
                            )}
                        </p>
                        <Badge variant="outline" className="capitalize">
                            {currentDocument.type.toString()}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/documents/${id}`)}
                    >
                        View Document
                    </Button>
                </div>
            </div>

            {/* Document Analysis History */}
            {documentAnalyses.length > 0 && (
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Analysis History</CardTitle>
                        <CardDescription>
                            Previous analyses performed on this document
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {documentAnalyses.map((analysis) => (
                                <div
                                    key={analysis.id}
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/dashboard/analysis/${analysis.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-background rounded-md">
                                            <AnalysisTypeIcon
                                                type={analysis.analysis_code}
                                                className="h-5 w-5 text-primary"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {analysis.analysis_code === 'table_analysis' ? 'Table Analysis' :
                                                    analysis.analysis_code === 'text_analysis' ? 'Text Analysis' :
                                                        analysis.analysis_code}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(analysis.created_at), 'PPp')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-2 py-0.5 text-xs rounded-full ${analysis.status === AnalysisStatus.COMPLETED ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            analysis.status === AnalysisStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                analysis.status === AnalysisStatus.FAILED ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {analysis.status}
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* New Analysis Section */}
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">New Analysis</CardTitle>
                    <CardDescription>
                        Select an analysis type to run on this document
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {compatibleAnalysisTypes.map((analysisType) => (
                            <Card
                                key={analysisType.id}
                                className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${selectedAnalysisType === analysisType.id
                                    ? 'border-primary ring-1 ring-primary'
                                    : 'hover:bg-muted/50'
                                    }`}
                                onClick={() => setSelectedAnalysisType(analysisType.id)}
                            >
                                <CardHeader className="border-b bg-muted/30 pb-3">
                                    <div className="flex items-center gap-2">
                                        <AnalysisTypeIcon
                                            type={analysisType.code}
                                            className="h-5 w-5 text-primary"
                                        />
                                        <CardTitle className="text-base">
                                            {analysisType.name.split('_')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ')
                                            }
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-3">
                                    <p className="text-sm text-muted-foreground">
                                        {analysisType.description || `Run ${analysisType.name} on your document`}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}

                        {compatibleAnalysisTypes.length === 0 && (
                            <div className="col-span-full text-center py-6">
                                <p className="text-muted-foreground">
                                    No compatible analysis types found for this document type.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 pt-3 flex justify-end">
                    <Button
                        onClick={handleStartAnalysis}
                        disabled={!selectedAnalysisType || isStartingAnalysis}
                    >
                        {isStartingAnalysis && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Start Analysis
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
} 