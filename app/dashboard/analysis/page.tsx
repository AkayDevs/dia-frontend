'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Document, DocumentType } from '@/types/document';
import { AnalysisStatus, AnalysisDefinitionInfo, StepDefinitionInfo, AnalysisMode } from '@/types/analysis_configs';
import { AnalysisRunWithResults, StepExecutionResultInfo } from '@/types/analysis_execution';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, formatDistanceToNow } from 'date-fns';
import {
    FileText,
    Table as TableIcon,
    FileStack,
    Clock,
    CheckCircle,
    XCircle,
    ArrowRight,
    RefreshCw,
    Settings,
    Zap,
    File,
    BarChart,
    History,
    Layers,
    Loader2
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { AnalysisTypeEnum } from '@/lib/enums';
import type { JSX } from 'react';

// Analysis type interfaces
interface AnalysisType {
    id: string;
    name: string;
    description: string;
    supported_document_types: DocumentType[];
    steps: StepDefinitionInfo[];
}

interface DashboardAnalysis extends AnalysisRunWithResults {
    type: string;
}

// Analysis type icon mapping
const AnalysisTypeIcon = ({ type, className = "h-5 w-5" }: { type: string; className?: string }) => {
    const icons: Record<string, JSX.Element> = {
        'table_analysis': <TableIcon className={className} />,
        'text_analysis': <FileText className={className} />,
        'template_conversion': <FileStack className={className} />
    };
    return icons[type] || <FileText className={className} />;
};

// Analysis card component
interface AnalysisCardProps {
    analysisType: AnalysisDefinitionInfo;
    onSelect?: () => void;
    selected?: boolean;
}

const AnalysisCard = ({ analysisType, onSelect, selected }: AnalysisCardProps) => (
    <Card
        className={`overflow-hidden transition-colors hover:bg-muted/50 cursor-pointer ${selected ? 'border-primary' : ''}`}
        onClick={onSelect}
    >
        <CardHeader className="border-b bg-muted/50">
            <CardTitle className="flex items-center gap-2 text-lg">
                <AnalysisTypeIcon type={analysisType.code} className="text-primary" />
                {analysisType.name.split('_').map((word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
            </CardTitle>
            <CardDescription>
                {analysisType.description}
            </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium mb-2">Supported Document Types</h4>
                    <div className="flex flex-wrap gap-2">
                        {analysisType.supported_document_types.map((format: DocumentType) => (
                            <Badge key={format} variant="secondary">
                                {format.toUpperCase()}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

// Recent analysis card component
interface RecentAnalysisProps {
    document: Document;
    analyses: AnalysisRunWithResults[];
}

const RecentAnalysisCard = ({ document, analyses }: RecentAnalysisProps) => {
    const router = useRouter();
    const documentAnalyses = analyses.filter(analysis => analysis.document_id === document.id);
    const analysesByType = documentAnalyses.reduce<Record<string, AnalysisRunWithResults[]>>((acc, analysis) => {
        if (!acc[analysis.analysis_code]) {
            acc[analysis.analysis_code] = [];
        }
        acc[analysis.analysis_code].push(analysis);
        return acc;
    }, {});

    return (
        <Card>
            <CardHeader>
                <CardTitle>{document.name}</CardTitle>
                <CardDescription>
                    Last analyzed {formatDistanceToNow(new Date(documentAnalyses[0]?.created_at || Date.now()))} ago
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Object.entries(analysesByType).map(([typeId, typeAnalyses]) => (
                        <div key={typeId} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <AnalysisTypeIcon type={typeId} />
                                <span className="font-medium">
                                    {typeId.split('_').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </span>
                            </div>
                            <div className="pl-8 space-y-2">
                                {typeAnalyses.map(analysis => (
                                    <div
                                        key={analysis.id}
                                        className="flex items-center justify-between"
                                        onClick={() => router.push(`/dashboard/analysis/${analysis.id}`)}
                                    >
                                        <span className="text-sm text-muted-foreground">
                                            {format(new Date(analysis.created_at), 'MMM d, yyyy HH:mm')}
                                        </span>
                                        <Badge variant="outline">
                                            {analysis.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const StepResultCard = ({ result }: { result: StepExecutionResultInfo }) => {
    return (
        <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{result.step_definition_id}</h4>
                <Badge variant={result.status === AnalysisStatus.COMPLETED ? 'default' : 'secondary'}>
                    {result.status}
                </Badge>
            </div>
            {result.error_message && (
                <p className="text-sm text-muted-foreground">{result.error_message}</p>
            )}
        </div>
    );
};

export default function AnalysisPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<string | null>(null);
    const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);

    const {
        analysisDefinitions = [] as AnalysisDefinitionInfo[],
        analyses = [],
        isLoading: isLoadingAnalysis,
        fetchAnalysisDefinitions,
        fetchUserAnalyses,
        startAnalysis
    } = useAnalysisStore();

    const {
        documents = [],
        isLoading: isLoadingDocuments,
        fetchDocuments
    } = useDocumentStore();

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchDocuments(),
                    fetchAnalysisDefinitions(),
                    fetchUserAnalyses()
                ]);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load analysis data",
                    variant: "destructive"
                });
            }
        };
        loadData();
    }, [fetchDocuments, fetchAnalysisDefinitions, fetchUserAnalyses, toast]);

    const handleStartAnalysis = async (documentId: string) => {
        if (!selectedAnalysisType) {
            toast({
                description: "Please select an analysis type first",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsStartingAnalysis(true);
            const selectedDefinition = analysisDefinitions.find(def => def.id === selectedAnalysisType);
            if (!selectedDefinition) {
                throw new Error("Selected analysis type not found");
            }

            await startAnalysis(
                documentId,
                selectedDefinition.code,
                AnalysisMode.AUTOMATIC
            );

            toast({
                description: "Analysis started successfully",
            });

            // Navigate to the document's analysis page
            router.push(`/dashboard/documents/${documentId}`);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to start analysis",
                variant: "destructive"
            });
        } finally {
            setIsStartingAnalysis(false);
        }
    };

    const isLoading = isLoadingDocuments || isLoadingAnalysis || isStartingAnalysis;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Document Analysis</h1>
                    <p className="text-muted-foreground">
                        Analyze your documents using AI-powered tools
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard/documents')}
                        className="gap-2"
                    >
                        <FileText className="h-4 w-4" />
                        Documents
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard/history')}
                        className="gap-2"
                    >
                        <History className="h-4 w-4" />
                        History
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="analyze" className="space-y-8">
                <TabsList>
                    <TabsTrigger value="analyze">Analyze</TabsTrigger>
                    <TabsTrigger value="recent">Recent Analyses</TabsTrigger>
                </TabsList>
                <TabsContent value="analyze">
                    <div className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {analysisDefinitions.map((analysisType) => (
                                <AnalysisCard
                                    key={analysisType.id}
                                    analysisType={analysisType}
                                    onSelect={() => setSelectedAnalysisType(analysisType.id)}
                                    selected={selectedAnalysisType === analysisType.id}
                                />
                            ))}
                        </div>
                        {selectedAnalysisType && (
                            <div className="flex justify-end">
                                <Button
                                    onClick={() => router.push('/dashboard/documents')}
                                    className="gap-2"
                                >
                                    Select Documents
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="recent">
                    <div className="grid gap-6">
                        {documents.map((document) => (
                            <RecentAnalysisCard
                                key={document.id}
                                document={document}
                                analyses={analyses.filter(a => a.document_id === document.id)}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 