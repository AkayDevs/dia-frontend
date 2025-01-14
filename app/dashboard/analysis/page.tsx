'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Document } from '@/types/document';
import {
    AnalysisType,
    AnalysisTypeEnum,
    Analysis,
    AnalysisStatus,
    AnalysisListParams
} from '@/types/analysis';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
    FileText,
    Table as TableIcon,
    FileSearch,
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

// Analysis type icon mapping
const AnalysisTypeIcon = ({ type, className = "h-5 w-5" }: { type: AnalysisTypeEnum; className?: string }) => {
    const icons = {
        [AnalysisTypeEnum.TABLE_DETECTION]: <TableIcon className={className} />,
        [AnalysisTypeEnum.TEXT_EXTRACTION]: <FileText className={className} />,
        [AnalysisTypeEnum.TEXT_SUMMARIZATION]: <FileSearch className={className} />,
        [AnalysisTypeEnum.TEMPLATE_CONVERSION]: <FileStack className={className} />
    };
    return icons[type] || <FileText className={className} />;
};

// Analysis card component
interface AnalysisCardProps {
    analysisType: AnalysisType;
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
                <AnalysisTypeIcon type={analysisType.name} className="text-primary" />
                {analysisType.name.split('_').map(word =>
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
                        {analysisType.supported_document_types.map((format) => (
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
    analyses: Analysis[];
}

const RecentAnalysisCard = ({ document, analyses }: RecentAnalysisProps) => {
    const router = useRouter();
    const documentAnalyses = analyses.filter(analysis => analysis.document_id === document.id);
    const analysesByType = documentAnalyses.reduce<Record<string, Analysis[]>>((acc, analysis) => {
        if (!acc[analysis.analysis_type_id]) {
            acc[analysis.analysis_type_id] = [];
        }
        acc[analysis.analysis_type_id].push(analysis);
        return acc;
    }, {});

    return (
        <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between p-4 bg-muted/30">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-medium text-lg">{document.name}</h4>
                        <p className="text-sm text-muted-foreground">
                            Last analyzed {formatDistanceToNow(new Date(documentAnalyses[0].created_at), { addSuffix: true })}
                        </p>
                    </div>
                </div>
                <Badge variant="secondary">{document.type.toUpperCase()}</Badge>
            </div>
            <Accordion type="single" collapsible className="w-full">
                {Object.entries(analysesByType).map(([typeId, typeAnalyses]) => (
                    <AccordionItem value={typeId} key={typeId}>
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <AnalysisTypeIcon type={typeId as AnalysisTypeEnum} />
                                <span className="font-medium">
                                    {typeId.split('_').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </span>
                                <Badge variant="outline" className="ml-2">
                                    {typeAnalyses.length}
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="px-4 py-2 space-y-2">
                                {typeAnalyses.map((analysis) => (
                                    <div
                                        key={analysis.id}
                                        className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                                        onClick={() => router.push(`/dashboard/analysis/${document.id}/${analysis.id}/results`)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {analysis.status === AnalysisStatus.COMPLETED ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : analysis.status === AnalysisStatus.FAILED ? (
                                                <XCircle className="h-4 w-4 text-destructive" />
                                            ) : (
                                                <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
                                            )}
                                            <span className="text-sm">
                                                {format(new Date(analysis.created_at), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/dashboard/analysis/${document.id}/${analysis.id}/step/${analysis.step_results[0].step_id}`);
                                                }}
                                            >
                                                Step-wise View
                                                <Settings className="ml-2 h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                View Results
                                                <ArrowRight className="ml-2 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default function AnalysisPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('recent');
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<string | null>(null);

    // Get documents and analysis configurations
    const {
        documents = [],
        isLoading: isLoadingDocs,
        fetchDocuments
    } = useDocumentStore();

    const {
        analysisTypes = [],
        analyses = [],
        isLoading: isLoadingAnalysis,
        fetchAnalysisTypes,
        fetchUserAnalyses
    } = useAnalysisStore();

    // Check for batch analysis documents from URL
    const batchDocuments = searchParams.get('documents')?.split(',') || [];

    // Initialize data
    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchDocuments(),
                    fetchAnalysisTypes(),
                    fetchUserAnalyses()
                ]);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load analysis data",
                    variant: "destructive",
                });
            }
        };
        loadData();
    }, [fetchDocuments, fetchAnalysisTypes, fetchUserAnalyses, toast]);

    // Get recently analyzed documents
    const recentDocuments = documents
        .filter(doc => analyses.some(analysis => analysis.document_id === doc.id))
        .sort((a, b) => {
            const latestA = analyses
                .filter(analysis => analysis.document_id === a.id)
                .reduce((latest, analysis) => Math.max(latest, new Date(analysis.created_at).getTime()), 0);
            const latestB = analyses
                .filter(analysis => analysis.document_id === b.id)
                .reduce((latest, analysis) => Math.max(latest, new Date(analysis.created_at).getTime()), 0);
            return latestB - latestA;
        })
        .slice(0, 5);

    // Handle document selection
    const handleDocumentSelect = (documentId: string) => {
        if (!selectedAnalysisType) {
            toast({
                description: "Please select an analysis type first",
                duration: 3000,
            });
            return;
        }
        router.push(`/dashboard/analysis/${documentId}?type=${selectedAnalysisType}`);
    };

    const isLoading = isLoadingDocs || isLoadingAnalysis;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-8">
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
                        onClick={() => router.push('/dashboard/analysis/new')}
                        className="gap-2"
                    >
                        <Zap className="h-4 w-4" />
                        New Analysis
                    </Button>
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
                        onClick={() => router.push('/dashboard/analysis/history')}
                        className="gap-2"
                    >
                        <History className="h-4 w-4" />
                        History
                    </Button>
                </div>
            </div>

            {/* Batch Analysis Notice */}
            {batchDocuments.length > 0 && (
                <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Layers className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Batch Analysis Mode</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {batchDocuments.length} documents selected for analysis
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/dashboard/documents')}
                            >
                                Change Selection
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="recent" className="gap-2">
                        <Clock className="h-4 w-4" />
                        Recent
                    </TabsTrigger>
                    <TabsTrigger value="analyze" className="gap-2">
                        <BarChart className="h-4 w-4" />
                        Analyze
                    </TabsTrigger>
                    <TabsTrigger value="capabilities" className="gap-2">
                        <Zap className="h-4 w-4" />
                        Capabilities
                    </TabsTrigger>
                </TabsList>

                {/* Recent Tab */}
                <TabsContent value="recent">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Recent Analyses
                                </CardTitle>
                                <CardDescription>
                                    Recently analyzed documents and their results
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentDocuments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <File className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                                        <h3 className="mt-4 text-lg font-semibold">No Recent Analyses</h3>
                                        <p className="text-muted-foreground">
                                            Start analyzing documents to see them here
                                        </p>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[400px] pr-4">
                                        <div className="space-y-4">
                                            {recentDocuments.map((doc) => (
                                                <RecentAnalysisCard
                                                    key={doc.id}
                                                    document={doc}
                                                    analyses={analyses}
                                                />
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Analyze Tab */}
                <TabsContent value="analyze">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {analysisTypes.map((analysisType) => (
                            <AnalysisCard
                                key={analysisType.id}
                                analysisType={analysisType}
                                selected={selectedAnalysisType === analysisType.id}
                                onSelect={() => setSelectedAnalysisType(analysisType.id)}
                            />
                        ))}
                    </div>
                    {selectedAnalysisType && (
                        <div className="mt-6 flex justify-end">
                            <Button
                                size="lg"
                                onClick={() => router.push('/dashboard/documents')}
                            >
                                Select Documents
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* Capabilities Tab */}
                <TabsContent value="capabilities">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" />
                                Analysis Capabilities
                            </CardTitle>
                            <CardDescription>
                                Available analysis types and their features
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-8">
                                {analysisTypes.map((analysisType, index) => (
                                    <div key={analysisType.id}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 rounded-lg bg-primary/10">
                                                <AnalysisTypeIcon type={analysisType.name} className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold">
                                                    {analysisType.name.split('_').map(word =>
                                                        word.charAt(0).toUpperCase() + word.slice(1)
                                                    ).join(' ')}
                                                </h3>
                                                <p className="text-muted-foreground">{analysisType.description}</p>
                                            </div>
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-2 pl-14">
                                            <div>
                                                <h4 className="text-sm font-medium mb-3">Supported Document Types</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysisType.supported_document_types.map((format) => (
                                                        <Badge key={format} variant="secondary">
                                                            {format.toUpperCase()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium mb-3">Analysis Steps</h4>
                                                <div className="space-y-2">
                                                    {analysisType.steps.map((step) => (
                                                        <div key={step.id} className="flex items-center gap-2">
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                            <span className="text-sm">
                                                                {step.name.split('_').map(word =>
                                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                                ).join(' ')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {index < analysisTypes.length - 1 && (
                                            <Separator className="my-8" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 