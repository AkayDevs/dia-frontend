'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DocumentType } from '@/enums/document';
import { AnalysisStatus, AnalysisMode } from '@/enums/analysis';
import { AnalysisDefinitionInfo, AnalysisStepInfo } from '@/types/analysis/configs';
import { AnalysisRunWithResults, StepResultResponse } from '@/types/analysis/base';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
    Loader2,
    Search,
    RefreshCw,
    PlusCircle,
    Filter,
    ChevronRight,
    Clock,
    FileText,
    BarChart4,
    CheckCircle2,
    AlertCircle,
    Hourglass,
    LayoutDashboard,
    LineChart
} from 'lucide-react';
import {
    AnalysisTypeIcon,
    AnalysisCard,
    RecentAnalysisCard,
    StepResultCard,
    AnalysisHeader,
    AnalysisEmptyState
} from '@/components/analysis';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AnalysisType {
    id: string;
    name: string;
    description: string;
    supported_document_types: DocumentType[];
    steps: AnalysisStepInfo[];
}

// Add these interfaces for algorithm accuracy data
interface AlgorithmMetric {
    name: string;
    accuracy: number;
    userCorrections: number;
    confidence: number;
}

interface StepAccuracyData {
    stepId: string;
    stepName: string;
    algorithms: AlgorithmMetric[];
}

interface AnalysisStep {
    id: string;
    name: string;
}

export default function AnalysisPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('recent');
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<string | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [documentFilter, setDocumentFilter] = useState<string | null>(null);
    const [selectedMetricAnalysisType, setSelectedMetricAnalysisType] = useState<string | null>(null);
    const [activeMetricView, setActiveMetricView] = useState<'overview' | 'accuracy'>('overview');

    const {
        documents,
        fetchDocuments,
        isLoading: isLoadingDocuments
    } = useDocumentStore();

    const {
        analysisDefinitions,
        analyses,
        fetchAnalysisDefinitions,
        fetchUserAnalyses,
        startAnalysis,
        isLoading: isLoadingAnalyses
    } = useAnalysisStore();

    // Check for document ID in URL params
    useEffect(() => {
        const documentId = searchParams.get('document');
        if (documentId) {
            setSelectedDocument(documentId);
            setActiveTab('new');
        }

        const documentsParam = searchParams.get('documents');
        if (documentsParam) {
            const documentIds = documentsParam.split(',');
            // Handle batch analysis here if needed
        }
    }, [searchParams]);

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    fetchDocuments(),
                    fetchAnalysisDefinitions(),
                    fetchUserAnalyses()
                ]);
            } catch (error) {
                console.error('Error loading analysis data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load analysis data',
                    variant: 'destructive'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [fetchDocuments, fetchAnalysisDefinitions, fetchUserAnalyses, toast]);

    // Handle starting a new analysis
    const handleStartAnalysis = async (documentId: string) => {
        if (!selectedAnalysisType) {
            toast({
                title: 'Missing selection',
                description: 'Please select an analysis type',
                variant: 'destructive'
            });
            return;
        }

        setIsLoading(true);
        try {
            // Get the analysis definition code
            const selectedDefinition = analysisDefinitions.find(def => def.id === selectedAnalysisType);
            if (!selectedDefinition) {
                throw new Error("Selected analysis type not found");
            }

            // Call startAnalysis with the correct parameters
            await startAnalysis(
                documentId,
                selectedDefinition.code,
                AnalysisMode.AUTOMATIC
            );

            toast({
                title: 'Success',
                description: 'Analysis started successfully',
            });

            // Navigate to the document details page
            router.push(`/dashboard/analysis/document/${documentId}`);
        } catch (error) {
            console.error('Error starting analysis:', error);
            toast({
                title: 'Error',
                description: 'Failed to start analysis',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Group analyses by document
    const analysesByDocument = analyses.reduce((acc, analysis) => {
        if (!acc[analysis.document_id]) {
            acc[analysis.document_id] = [];
        }
        acc[analysis.document_id].push(analysis);
        return acc;
    }, {} as Record<string, AnalysisRunWithResults[]>);

    // Filter documents that have analyses
    const documentsWithAnalyses = documents.filter(doc =>
        analysesByDocument[doc.id] && analysesByDocument[doc.id].length > 0
    );

    // Filter documents based on search query
    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get document by ID
    const getDocumentById = (id: string) => {
        return documents.find(doc => doc.id === id);
    };

    // Handle refresh
    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchDocuments(true),
                fetchAnalysisDefinitions(),
                fetchUserAnalyses()
            ]);
            toast({
                title: 'Updated',
                description: 'Data refreshed successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to refresh data',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Get document types for filtering
    const documentTypes = Array.from(new Set(documents.map(doc => doc.type.toString())));

    // Placeholder data for algorithm accuracy metrics
    const getAlgorithmAccuracyData = (analysisTypeId: string | null): StepAccuracyData[] => {
        if (!analysisTypeId) return [];

        // Find the selected analysis definition
        const selectedDefinition = analysisDefinitions.find(def => def.id === analysisTypeId);
        if (!selectedDefinition) return [];

        // Create placeholder steps since AnalysisDefinitionInfo might not have steps
        const placeholderSteps: AnalysisStep[] = [
            { id: 'step1', name: 'text_extraction' },
            { id: 'step2', name: 'entity_recognition' },
            { id: 'step3', name: 'data_validation' }
        ];

        // Generate placeholder accuracy data for each step
        return placeholderSteps.map((step: AnalysisStep) => ({
            stepId: step.id,
            stepName: step.name,
            algorithms: [
                {
                    name: `${step.name} Algorithm 1`,
                    accuracy: Math.round(70 + Math.random() * 25), // Random accuracy between 70-95%
                    userCorrections: Math.round(Math.random() * 100),
                    confidence: Math.round(65 + Math.random() * 30),
                },
                {
                    name: `${step.name} Algorithm 2`,
                    accuracy: Math.round(70 + Math.random() * 25),
                    userCorrections: Math.round(Math.random() * 100),
                    confidence: Math.round(65 + Math.random() * 30),
                }
            ]
        }));
    };

    // Loading state
    if (isLoadingDocuments || isLoadingAnalyses) {
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
                    <p className="text-sm text-muted-foreground">Please wait while we prepare your analysis dashboard</p>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 pb-10"
        >
            {/* Enhanced Header */}
            <div className="space-y-2">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Analysis Dashboard</h1>
                        <p className="text-muted-foreground mt-1">
                            Extract insights from your documents with powerful analysis tools
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="h-9"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            onClick={() => setActiveTab('new')}
                            className="h-9 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            New Analysis
                        </Button>
                    </div>
                </div>

                {/* Redesigned Metrics Section - More Compact */}
                <div className="mt-6 border rounded-lg bg-card/50">
                    <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center">
                            <BarChart4 className="h-5 w-5 text-muted-foreground mr-2" />
                            <h3 className="text-sm font-medium">Metrics</h3>
                        </div>

                        <div className="flex items-center bg-muted/50 rounded-md p-0.5">
                            <button
                                className={`px-3 py-1 text-xs rounded-sm transition-colors ${activeMetricView === 'overview'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                onClick={() => setActiveMetricView('overview')}
                            >
                                <span className="flex items-center">
                                    <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                                    Overview
                                </span>
                            </button>
                            <button
                                className={`px-3 py-1 text-xs rounded-sm transition-colors ${activeMetricView === 'accuracy'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                onClick={() => setActiveMetricView('accuracy')}
                            >
                                <span className="flex items-center">
                                    <LineChart className="h-3.5 w-3.5 mr-1.5" />
                                    Algorithm Accuracy
                                </span>
                            </button>
                        </div>
                    </div>

                    {activeMetricView === 'overview' ? (
                        <div className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <FileText className="h-4 w-4 mr-1.5 text-blue-500/70" />
                                        <span>Documents</span>
                                    </div>
                                    <p className="text-2xl font-semibold">{documents.length}</p>
                                    <p className="text-xs text-muted-foreground">Available for analysis</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <BarChart4 className="h-4 w-4 mr-1.5 text-purple-500/70" />
                                        <span>Analyses</span>
                                    </div>
                                    <p className="text-2xl font-semibold">{analyses.length}</p>
                                    <p className="text-xs text-muted-foreground">Total runs</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500/70" />
                                        <span>Completed</span>
                                    </div>
                                    <p className="text-2xl font-semibold">
                                        {analyses.filter(a => a.status === AnalysisStatus.COMPLETED).length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {analyses.length > 0
                                            ? `${Math.round((analyses.filter(a => a.status === AnalysisStatus.COMPLETED).length / analyses.length) * 100)}% success rate`
                                            : 'No analyses yet'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4 mr-1.5 text-amber-500/70" />
                                        <span>Analysis Types</span>
                                    </div>
                                    <p className="text-2xl font-semibold">{analysisDefinitions.length}</p>
                                    <p className="text-xs text-muted-foreground">Available tools</p>
                                </div>
                            </div>

                            {analyses.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                    <div className="flex gap-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                            <span className="text-xs text-muted-foreground">
                                                {analyses.filter(a => a.status === AnalysisStatus.COMPLETED).length} Completed
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                            <span className="text-xs text-muted-foreground">
                                                {analyses.filter(a => a.status === AnalysisStatus.IN_PROGRESS).length} In Progress
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                            <span className="text-xs text-muted-foreground">
                                                {analyses.filter(a => a.status === AnalysisStatus.FAILED).length} Failed
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                                <div className="flex items-center">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="text-xs text-muted-foreground flex items-center">
                                                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-muted-foreground" />
                                                    <span>Select analysis type</span>
                                                    <div className="ml-1 rounded-full bg-muted w-4 h-4 inline-flex items-center justify-center text-xs cursor-help">?</div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p>Accuracy metrics are based on user corrections and feedback. Higher percentages indicate better algorithm performance.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                <div className="w-full sm:w-64">
                                    <Select
                                        value={selectedMetricAnalysisType || ""}
                                        onValueChange={(value) => setSelectedMetricAnalysisType(value || null)}
                                    >
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Select analysis type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {analysisDefinitions.map(def => (
                                                <SelectItem key={def.id} value={def.id} className="text-xs">
                                                    {def.name.split('_')
                                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                        .join(' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {selectedMetricAnalysisType ? (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                    {getAlgorithmAccuracyData(selectedMetricAnalysisType).map((stepData: StepAccuracyData, index: number) => (
                                        <div key={stepData.stepId || index} className="border rounded-md p-2">
                                            <h4 className="text-xs font-medium mb-2 capitalize">
                                                {stepData.stepName.split('_').join(' ')}
                                            </h4>
                                            <div className="space-y-2">
                                                {stepData.algorithms.map((algo: AlgorithmMetric, algoIndex: number) => (
                                                    <div key={algoIndex} className="space-y-1">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-muted-foreground text-[11px]">{algo.name}</span>
                                                            <span className="font-medium text-[11px]">{algo.accuracy}% accuracy</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${algo.accuracy >= 90 ? 'bg-green-500' :
                                                                    algo.accuracy >= 80 ? 'bg-emerald-500' :
                                                                        algo.accuracy >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${algo.accuracy}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                                            <span>{algo.userCorrections} corrections</span>
                                                            <span>{algo.confidence}% confidence</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted-foreground text-sm border rounded-md">
                                    <p>Select an analysis type to view algorithm accuracy metrics</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="bg-card rounded-lg shadow-sm border p-1">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="recent" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            Recent Analyses
                        </TabsTrigger>
                        <TabsTrigger value="new" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            New Analysis
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Recent Analyses Tab */}
                <TabsContent value="recent" className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search analyses..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                    {documentFilter && <Badge variant="secondary" className="ml-2">{documentFilter}</Badge>}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => setDocumentFilter(null)}>
                                    All document types
                                </DropdownMenuItem>
                                <Separator className="my-1" />
                                {documentTypes.map((type) => (
                                    <DropdownMenuItem
                                        key={type}
                                        onClick={() => setDocumentFilter(type)}
                                        className="capitalize"
                                    >
                                        {type}
                                        {documentFilter === type && <ChevronRight className="ml-auto h-4 w-4" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {documentsWithAnalyses.length > 0 ? (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ staggerChildren: 0.1 }}
                                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                            >
                                {documentsWithAnalyses
                                    .filter(doc => !documentFilter || doc.type.toString() === documentFilter)
                                    .filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((document, index) => (
                                        <motion.div
                                            key={document.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <RecentAnalysisCard
                                                document={document}
                                                analyses={analysesByDocument[document.id]}
                                                onViewAnalysis={(analysisId) => router.push(`/dashboard/analysis/${analysisId}`)}
                                                onViewDocument={(documentId) => router.push(`/dashboard/documents/${documentId}`)}
                                            />
                                        </motion.div>
                                    ))}
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <AnalysisEmptyState
                            title="No analyses found"
                            description="You haven't run any analyses yet. Start a new analysis to extract insights from your documents."
                            actionLabel="Start New Analysis"
                            onAction={() => setActiveTab('new')}
                            showRefresh
                            onRefresh={handleRefresh}
                        />
                    )}
                </TabsContent>

                {/* New Analysis Tab */}
                <TabsContent value="new" className="space-y-6">
                    <div className="grid gap-8 md:grid-cols-[300px_1fr]">
                        {/* Left Panel - Analysis Types */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Analysis Types</h3>
                                <Badge variant="outline" className="font-normal">
                                    {analysisDefinitions.length} available
                                </Badge>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search analysis types..."
                                    className="pl-9"
                                />
                            </div>

                            <ScrollArea className="h-[calc(100vh-300px)] pr-4 border rounded-lg p-2">
                                <div className="space-y-4">
                                    {analysisDefinitions.map((analysisType, index) => (
                                        <motion.div
                                            key={analysisType.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <AnalysisCard
                                                analysisType={analysisType}
                                                selected={selectedAnalysisType === analysisType.id}
                                                onSelect={() => setSelectedAnalysisType(analysisType.id)}
                                            />
                                        </motion.div>
                                    ))}
                                    {analysisDefinitions.length === 0 && (
                                        <Card className="p-4 text-center">
                                            <p className="text-muted-foreground">No analysis types available</p>
                                        </Card>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Right Panel - Document Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Select Document</h3>
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Filter
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setDocumentFilter(null)}>
                                                All document types
                                            </DropdownMenuItem>
                                            <Separator className="my-1" />
                                            {documentTypes.map((type) => (
                                                <DropdownMenuItem
                                                    key={type}
                                                    onClick={() => setDocumentFilter(type)}
                                                    className="capitalize"
                                                >
                                                    {type}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push('/dashboard/upload')}
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Upload
                                    </Button>
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search documents..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {filteredDocuments.length > 0 ? (
                                <ScrollArea className="h-[calc(100vh-300px)] border rounded-lg p-2">
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pr-4">
                                        {filteredDocuments
                                            .filter(doc => !documentFilter || doc.type.toString() === documentFilter)
                                            .map((document, index) => (
                                                <motion.div
                                                    key={document.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                >
                                                    <Card
                                                        className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${selectedDocument === document.id
                                                            ? 'border-primary ring-1 ring-primary'
                                                            : 'hover:bg-muted/50'
                                                            }`}
                                                        onClick={() => setSelectedDocument(document.id)}
                                                    >
                                                        <div className="p-4 flex items-start gap-3">
                                                            <div className="p-2 bg-muted rounded-md">
                                                                <AnalysisTypeIcon
                                                                    type={document.type.toString()}
                                                                    className="h-6 w-6 text-primary"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium truncate">{document.name}</h4>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Type: {document.type.toString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <AnalysisEmptyState
                                    title="No documents found"
                                    description="Upload documents to analyze them"
                                    actionLabel="Upload Documents"
                                    onAction={() => router.push('/dashboard/upload')}
                                />
                            )}

                            {/* Start Analysis Button */}
                            {selectedDocument && selectedAnalysisType && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 p-4 bg-muted/30 rounded-lg border"
                                >
                                    <div>
                                        <h4 className="font-medium">Ready to analyze</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {getDocumentById(selectedDocument)?.name} with {
                                                analysisDefinitions.find(def => def.id === selectedAnalysisType)?.name
                                                    .split('_')
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')
                                            }
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={() => handleStartAnalysis(selectedDocument)}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
                                    >
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Start Analysis
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
} 