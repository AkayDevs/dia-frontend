'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
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
    File
} from 'lucide-react';
import { format } from 'date-fns';
import { Document, documentService } from '@/services/document.service';
import { analysisService, AnalysisType, AnalysisStatus, AnalysisTypeInfo, AnalysisResult } from '@/services/analysis.service';

export default function AnalysisPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [analysisTypes, setAnalysisTypes] = useState<AnalysisTypeInfo[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('select');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [types, docs] = await Promise.all([
                    analysisService.getAnalysisTypes(),
                    documentService.getDocuments({ limit: 10 })
                ]);
                setAnalysisTypes(types);
                setDocuments(docs);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch data. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    const handleDocumentSelect = (documentId: string) => {
        router.push(`/dashboard/analysis/${documentId}`);
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Document Analysis</h1>
                    <p className="text-muted-foreground mt-2">
                        Select a document to analyze using AI-powered tools
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 w-full md:w-auto"
                    onClick={() => window.location.reload()}
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="select" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Select Document
                    </TabsTrigger>
                    <TabsTrigger value="capabilities" className="gap-2">
                        <Zap className="h-4 w-4" />
                        Capabilities
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="select" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Select Document
                                </CardTitle>
                                <CardDescription>
                                    Choose a document from your uploads to begin the analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-[300px]">
                                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : documents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                                        <File className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Upload some documents to get started with analysis
                                        </p>
                                        <Button onClick={() => router.push('/dashboard')}>
                                            Upload Documents
                                        </Button>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[400px] pr-4">
                                        <div className="space-y-4">
                                            {documents.map((doc) => (
                                                <Card
                                                    key={doc.id}
                                                    className="flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                                    onClick={() => handleDocumentSelect(doc.id)}
                                                >
                                                    <div className="p-2 rounded-lg bg-primary/10 mr-4">
                                                        <FileText className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h4 className="font-medium">{doc.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Uploaded on {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                                                        </p>
                                                    </div>
                                                    <Button variant="ghost" size="icon">
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                </Card>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>

                        {analysisTypes.slice(0, 2).map((type) => (
                            <Card key={type.type} className="overflow-hidden">
                                <CardHeader className="border-b bg-muted/50">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        {type.type === AnalysisType.TABLE_DETECTION ? (
                                            <TableIcon className="h-5 w-5 text-primary" />
                                        ) : (
                                            <FileSearch className="h-5 w-5 text-primary" />
                                        )}
                                        {type.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {type.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-medium mb-3">Supported Formats</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {type.supported_formats.map((format) => (
                                                    <Badge key={format} variant="secondary">
                                                        {format.toUpperCase()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-3">Parameters</h4>
                                            <div className="space-y-3">
                                                {Object.entries(type.parameters).map(([key, param]) => (
                                                    <div key={key} className="text-sm">
                                                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                                                        <span className="text-muted-foreground">{param.description}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="capabilities">
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" />
                                Analysis Capabilities
                            </CardTitle>
                            <CardDescription>
                                Explore available analysis types and their configurations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-muted-foreground mt-4">Loading capabilities...</p>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {analysisTypes.map((type) => (
                                        <div key={type.type} className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-lg bg-primary/10">
                                                    {type.type === AnalysisType.TABLE_DETECTION ? (
                                                        <TableIcon className="h-6 w-6 text-primary" />
                                                    ) : (
                                                        <FileSearch className="h-6 w-6 text-primary" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold">{type.name}</h3>
                                                    <p className="text-muted-foreground">{type.description}</p>
                                                </div>
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div>
                                                    <h4 className="text-sm font-medium mb-3">Supported Formats</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {type.supported_formats.map((format) => (
                                                            <Badge key={format} variant="secondary">
                                                                {format.toUpperCase()}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium mb-3">Parameters</h4>
                                                    <div className="grid gap-4">
                                                        {Object.entries(type.parameters).map(([key, param]) => (
                                                            <Card key={key} className="p-4">
                                                                <h5 className="font-medium capitalize mb-2">
                                                                    {key.replace(/_/g, ' ')}
                                                                </h5>
                                                                <div className="space-y-2 text-sm text-muted-foreground">
                                                                    <p>{param.description}</p>
                                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                                        <div>Type: <span className="font-medium">{param.type}</span></div>
                                                                        {param.min !== undefined && (
                                                                            <div>Min: <span className="font-medium">{param.min}</span></div>
                                                                        )}
                                                                        {param.max !== undefined && (
                                                                            <div>Max: <span className="font-medium">{param.max}</span></div>
                                                                        )}
                                                                        <div>Default: <span className="font-medium">{String(param.default)}</span></div>
                                                                    </div>
                                                                    {param.options && (
                                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                                            {param.options.map((option) => (
                                                                                <Badge key={option} variant="outline" className="text-xs">
                                                                                    {option}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {type !== analysisTypes[analysisTypes.length - 1] && (
                                                <Separator className="my-8" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 