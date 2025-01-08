'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Document } from '@/types/document';
import { AnalysisType, AnalysisConfig } from '@/types/analysis';
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
import { format } from 'date-fns';
import {
    FileText,
    Upload,
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
    Layers
} from 'lucide-react';

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

// Analysis card component
interface AnalysisCardProps {
    config: AnalysisConfig;
    onSelect?: () => void;
    selected?: boolean;
}

const AnalysisCard = ({ config, onSelect, selected }: AnalysisCardProps) => (
    <Card
        className={`overflow-hidden transition-colors hover:bg-muted/50 cursor-pointer ${selected ? 'border-primary' : ''}`}
        onClick={onSelect}
    >
        <CardHeader className="border-b bg-muted/50">
            <CardTitle className="flex items-center gap-2 text-lg">
                <AnalysisTypeIcon type={config.type} className="text-primary" />
                {config.name}
            </CardTitle>
            <CardDescription>
                {config.description}
            </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium mb-2">Supported Formats</h4>
                    <div className="flex flex-wrap gap-2">
                        {config.supported_formats.map((format: string) => (
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
    onSelect: () => void;
}

const RecentAnalysisCard = ({ document, onSelect }: RecentAnalysisProps) => (
    <Card
        className="flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={onSelect}
    >
        <div className="p-2 rounded-lg bg-primary/10 mr-4">
            <FileText className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-grow">
            <h4 className="font-medium">{document.name}</h4>
            <p className="text-sm text-muted-foreground">
                Last analyzed {document.updated_at ? format(new Date(document.updated_at), 'PPp') : 'Never'}
            </p>
        </div>
        <Button variant="ghost" size="icon">
            <ArrowRight className="h-4 w-4" />
        </Button>
    </Card>
);

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
        availableTypes = [],
        analyses = [],
        isLoading: isLoadingAnalysis,
        loadAvailableTypes
    } = useAnalysisStore();

    // Check for batch analysis documents from URL
    const batchDocuments = searchParams.get('documents')?.split(',') || [];

    // Initialize data
    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchDocuments(),
                    loadAvailableTypes()
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
    }, []);

    // Get recently analyzed documents
    const recentDocuments = documents
        .filter(doc => doc.updated_at)
        .sort((a, b) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime())
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
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
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
                                                    onSelect={() => handleDocumentSelect(doc.id)}
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
                        {availableTypes.map((config) => (
                            <AnalysisCard
                                key={config.type}
                                config={config}
                                selected={selectedAnalysisType === config.type}
                                onSelect={() => setSelectedAnalysisType(config.type)}
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
                                {availableTypes.map((config, index) => (
                                    <div key={config.type}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 rounded-lg bg-primary/10">
                                                <AnalysisTypeIcon type={config.type} className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold">{config.name}</h3>
                                                <p className="text-muted-foreground">{config.description}</p>
                                            </div>
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-2 pl-14">
                                            <div>
                                                <h4 className="text-sm font-medium mb-3">Supported Formats</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {config.supported_formats.map((format: string) => (
                                                        <Badge key={format} variant="secondary">
                                                            {format.toUpperCase()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium mb-3">Parameters</h4>
                                                <div className="space-y-2">
                                                    {Object.entries(config.parameters).map(([key, param]) => (
                                                        <div key={key} className="flex items-center gap-2">
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                            <span className="text-sm">
                                                                {key.split('_').map(word =>
                                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                                ).join(' ')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {index < availableTypes.length - 1 && (
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