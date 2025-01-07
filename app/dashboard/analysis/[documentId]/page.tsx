'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalysisWizard } from '@/components/analysis/analysis-wizard';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useToast } from '@/hooks/use-toast';
import { FileText, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Document } from '@/types/document';

interface PageProps {
    params: {
        documentId: string;
    };
}

export default function AnalysisPage({ params }: PageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { documents, fetchDocuments } = useDocumentStore();
    const { setCurrentConfig, resetConfig } = useAnalysisStore();
    const [document, setDocument] = useState<Document | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializePage = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch documents if not already loaded
                if (documents.length === 0) {
                    await fetchDocuments();
                }

                const doc = documents.find(doc => doc.id === params.documentId);

                if (!doc) {
                    setError('Document not found');
                    return;
                }

                setDocument(doc);
                setCurrentConfig({
                    documentId: doc.id,
                    analysisTypes: [],
                    parameters: {}
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to load document';
                setError(message);
                toast({
                    title: "Error",
                    description: message,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        initializePage();

        // Cleanup
        return () => {
            resetConfig();
        };
    }, [params.documentId, documents, setCurrentConfig, resetConfig, fetchDocuments, toast]);

    const handleBack = () => {
        router.push('/dashboard');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error || 'Document not found. Please try again or contact support if the issue persists.'}
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
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <h1 className="text-3xl font-bold">Analyze Document</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Configure analysis options for {document.name}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        {(document.size / 1024 / 1024).toFixed(2)} MB • {document.type.toUpperCase()}
                    </span>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Analysis Configuration</CardTitle>
                    <CardDescription>
                        Select the types of analysis to perform on your document
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AnalysisWizard documentId={document.id} />
                </CardContent>
            </Card>
        </motion.div>
    );
} 