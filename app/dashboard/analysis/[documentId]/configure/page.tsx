'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Document } from '@/types/document';
import {
    AnalysisType,
    AnalysisConfig,
    TableDetectionParameters,
    TextExtractionParameters,
    TextSummarizationParameters,
    TemplateConversionParameters
} from '@/types/analysis';
import { motion } from 'framer-motion';
import { use } from 'react';
import {
    FileText,
    AlertTriangle,
    ArrowLeft,
    PlayCircle,
    Clock,
    Settings2,
    Table as TableIcon,
    FileSearch,
    FileStack
} from 'lucide-react';

interface ConfigurePageProps {
    params: Promise<{
        documentId: string;
    }>;
}

export default function ConfigurePage({ params }: ConfigurePageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [parameters, setParameters] = useState<Record<string, unknown>>({});

    // Unwrap the documentId from params
    const { documentId } = use(params);
    const analysisType = searchParams.get('type') as AnalysisType;

    const {
        documents,
        isLoading: isLoadingDocs,
        fetchDocuments
    } = useDocumentStore();

    const {
        availableTypes,
        isLoading: isLoadingAnalysis,
        loadAvailableTypes,
        startAnalysis
    } = useAnalysisStore();

    // Get the current document and analysis type config
    const document = documents.find(doc => doc.id === documentId);
    const typeConfig = availableTypes.find(type => type.type === analysisType);

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
                    description: "Failed to load data",
                    variant: "destructive",
                });
                router.push('/dashboard/documents');
            }
        };

        loadData();
    }, [fetchDocuments, loadAvailableTypes, router, toast]);

    // Initialize parameters with default values
    useEffect(() => {
        if (typeConfig) {
            const defaultParams = Object.entries(typeConfig.parameters).reduce((acc, [key, param]) => ({
                ...acc,
                [key]: param.default
            }), {} as Record<string, unknown>);
            setParameters(defaultParams);
        }
    }, [typeConfig]);

    const handleParameterChange = (key: string, value: unknown) => {
        setParameters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleStartAnalysis = async () => {
        try {
            setIsAnalyzing(true);

            await startAnalysis(documentId, {
                analysis_type: analysisType,
                parameters: parameters as any
            });

            toast({
                description: "Analysis started successfully",
                duration: 3000,
            });

            // Redirect to document details page
            router.push(`/dashboard/documents/${documentId}`);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to start analysis",
                variant: "destructive",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isLoadingDocs || isLoadingAnalysis) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!document || !typeConfig) {
        return (
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Invalid configuration. Please try again or contact support if the issue persists.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto p-6 max-w-7xl space-y-8"
        >
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            {/* Analysis Configuration Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                            {analysisType === AnalysisType.TABLE_DETECTION ? (
                                <TableIcon className="h-6 w-6 text-primary" />
                            ) : analysisType === AnalysisType.TEXT_EXTRACTION ? (
                                <FileText className="h-6 w-6 text-primary" />
                            ) : analysisType === AnalysisType.TEXT_SUMMARIZATION ? (
                                <FileSearch className="h-6 w-6 text-primary" />
                            ) : (
                                <FileStack className="h-6 w-6 text-primary" />
                            )}
                        </div>
                        <div>
                            <CardTitle>{typeConfig.name}</CardTitle>
                            <CardDescription>{typeConfig.description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6">
                        {Object.entries(typeConfig.parameters).map(([key, param]) => (
                            <div key={key} className="space-y-2">
                                <Label className="capitalize">
                                    {key.split('_').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </Label>
                                {param.type === 'boolean' ? (
                                    <Switch
                                        checked={!!parameters[key]}
                                        onCheckedChange={(checked) => handleParameterChange(key, checked)}
                                    />
                                ) : param.type === 'number' ? (
                                    <div className="space-y-2">
                                        <Slider
                                            value={[Number(parameters[key] || param.default)]}
                                            min={param.min}
                                            max={param.max}
                                            step={param.step || 1}
                                            onValueChange={([value]) => handleParameterChange(key, value)}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Min: {param.min}</span>
                                            <span>Current: {String(parameters[key])}</span>
                                            <span>Max: {param.max}</span>
                                        </div>
                                    </div>
                                ) : param.options ? (
                                    <Select
                                        value={String(parameters[key] || '')}
                                        onValueChange={(value) => handleParameterChange(key, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {param.options.map((option: string) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        type={param.type}
                                        value={String(parameters[key] || '')}
                                        onChange={(e) => handleParameterChange(key, e.target.value)}
                                        placeholder={`Enter ${key.split('_').join(' ')}`}
                                    />
                                )}
                                <p className="text-sm text-muted-foreground">
                                    {param.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button
                        size="lg"
                        onClick={handleStartAnalysis}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="mr-2"
                                >
                                    <Clock className="h-4 w-4" />
                                </motion.div>
                                Starting Analysis...
                            </>
                        ) : (
                            <>
                                Start Analysis
                                <PlayCircle className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
} 