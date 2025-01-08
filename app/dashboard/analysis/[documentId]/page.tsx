'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { AnalysisType } from '@/types/analysis';
import { motion } from 'framer-motion';
import { use } from 'react';
import {
    FileText,
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Table as TableIcon,
    FileSearch,
    FileStack,
    Settings
} from 'lucide-react';

interface AnalysisPageProps {
    params: Promise<{
        documentId: string;
    }>;
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [selectedType, setSelectedType] = useState<AnalysisType | null>(null);

    // Unwrap the documentId from params
    const { documentId } = use(params);

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

    // Get the current document
    const document = documents.find(doc => doc.id === documentId);

    // Get supported analysis types for this document type
    const supportedAnalysisTypes = availableTypes.filter(type =>
        type.supported_formats.includes(document?.type.toLowerCase() || '')
    );

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
                    description: "Failed to load document data",
                    variant: "destructive",
                });
                router.push('/dashboard/documents');
            }
        };

        loadData();
    }, [fetchDocuments, loadAvailableTypes, router, toast]);

    const handleRedirectToConfigure = async () => {
        if (!selectedType) {
            toast({
                description: "Please select an analysis type",
                duration: 3000,
            });
            return;
        }

        // Navigate to parameter configuration page
        router.push(`/dashboard/analysis/${documentId}/configure?type=${selectedType}`);
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

    if (!document) {
        return (
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/documents')}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Documents
                </Button>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Document not found. Please try again or contact support if the issue persists.
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
                    onClick={() => router.push('/dashboard/documents')}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Documents
                </Button>
            </div>

            {/* Document Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Document Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <h3 className="font-medium text-lg">{document.name}</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Badge variant="secondary">{document.type.toUpperCase()}</Badge>
                                <span>•</span>
                                <span>{(document.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Uploaded on {new Date(document.uploaded_at).toLocaleDateString()}
                            </p>
                            {document.updated_at && (
                                <p className="text-sm text-muted-foreground">
                                    Last analyzed on {new Date(document.updated_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Available Analysis Types */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Analysis Types</CardTitle>
                    <CardDescription>
                        Select an analysis type to process your {document.type.toUpperCase()} document
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    {supportedAnalysisTypes.length === 0 ? (
                        <div className="md:col-span-2 text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                            <h3 className="mt-4 text-lg font-semibold">No Supported Analysis Types</h3>
                            <p className="text-muted-foreground">
                                This document type does not support any analysis methods.
                            </p>
                        </div>
                    ) : (
                        supportedAnalysisTypes.map((type) => (
                            <Card
                                key={type.type}
                                className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedType === type.type ? 'border-primary' : ''
                                    }`}
                                onClick={() => setSelectedType(type.type)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        {type.type === AnalysisType.TABLE_DETECTION ? (
                                            <TableIcon className="h-5 w-5 text-primary" />
                                        ) : type.type === AnalysisType.TEXT_EXTRACTION ? (
                                            <FileText className="h-5 w-5 text-primary" />
                                        ) : type.type === AnalysisType.TEXT_SUMMARIZATION ? (
                                            <FileSearch className="h-5 w-5 text-primary" />
                                        ) : (
                                            <FileStack className="h-5 w-5 text-primary" />
                                        )}
                                        {type.name}
                                    </CardTitle>
                                    <CardDescription>{type.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Features</h4>
                                            <div className="space-y-2">
                                                {Object.entries(type.parameters).map(([key]) => (
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
                                </CardContent>
                            </Card>
                        ))
                    )}
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button
                        size="lg"
                        onClick={handleRedirectToConfigure}
                        disabled={ !selectedType || supportedAnalysisTypes.length === 0}
                    >
                        Configure Parameters
                        <Settings className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
} 