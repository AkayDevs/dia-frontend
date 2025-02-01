'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    AlertCircle,
    CheckCircle,
    XCircle,
    Trash2,
    Play,
    Settings,
    RotateCw,
    Clock
} from 'lucide-react';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
    Analysis,
    AnalysisStatus,
    AnalysisTypeEnum,
    AnalysisType,
    AnalysisRequest
} from '@/types/analysis';
import { Document, DocumentType } from '@/types/document';
import { cn } from '@/lib/utils';
import { BatchResultPreview } from '@/components/batch/batch-result-preview';

interface BatchItem {
    id: string;
    file: File;
    document?: Document;
    analysis?: Analysis;
    status: 'pending' | 'uploading' | 'uploaded' | 'analyzing' | 'completed' | 'failed';
    error?: string;
    progress: number;
}

export default function BatchPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { logout } = useAuthStore();
    const { uploadDocument } = useDocumentStore();
    const {
        analysisTypes,
        currentAnalysisType,
        fetchAnalysisTypes,
        fetchAnalysisType,
        startAnalysis
    } = useAnalysisStore();

    const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<BatchItem | null>(null);

    // Fetch analysis types on mount
    useEffect(() => {
        fetchAnalysisTypes().catch(error => {
            const message = error instanceof Error ? error.message : 'Failed to fetch analysis types';
            if (message.includes('Could not validate credentials')) {
                logout();
                router.push('/login');
            }
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        });
    }, []);

    // Handle file selection
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const newItems: BatchItem[] = files.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            status: 'pending',
            progress: 0
        }));
        setBatchItems(prev => [...prev, ...newItems]);
        event.target.value = ''; // Reset input
    }, []);

    // Handle file drop
    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        const newItems: BatchItem[] = files.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            status: 'pending',
            progress: 0
        }));
        setBatchItems(prev => [...prev, ...newItems]);
    }, []);

    // Process a single item
    const processItem = async (item: BatchItem): Promise<BatchItem> => {
        try {
            // Upload document
            setBatchItems(prev => prev.map(i =>
                i.id === item.id ? { ...i, status: 'uploading', progress: 33 } : i
            ));
            const document = await uploadDocument(item.file);

            // Start analysis
            setBatchItems(prev => prev.map(i =>
                i.id === item.id ? { ...i, document, status: 'analyzing', progress: 66 } : i
            ));

            const analysisRequest: AnalysisRequest = {
                analysis_type_id: selectedAnalysisType,
                mode: 'automatic',
                algorithm_configs: {} // Use default configurations
            };

            await useAnalysisStore.getState().startAnalysis(document.id, analysisRequest);

            // Since startAnalysis is void, we'll create a simple analysis object
            const analysis: Analysis = {
                id: Math.random().toString(36).substring(7), // Temporary ID
                document_id: document.id,
                analysis_type_id: selectedAnalysisType,
                mode: 'automatic',
                status: AnalysisStatus.PROCESSING,
                created_at: new Date().toISOString(),
                step_results: []
            };

            return {
                ...item,
                document,
                analysis,
                status: 'completed',
                progress: 100
            };
        } catch (error) {
            return {
                ...item,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Processing failed',
                progress: 0
            };
        }
    };

    // Start batch processing
    const startProcessing = async () => {
        if (!selectedAnalysisType) {
            toast({
                title: "Error",
                description: "Please select an analysis type",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);
        const pendingItems = batchItems.filter(item => item.status === 'pending');

        try {
            const results = await Promise.all(pendingItems.map(processItem));
            setBatchItems(prev => prev.map(item => {
                const result = results.find(r => r.id === item.id);
                return result || item;
            }));
            toast({
                description: "Batch processing completed",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Batch processing failed',
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Clear completed items
    const clearCompleted = () => {
        setBatchItems(prev => prev.filter(item =>
            item.status !== 'completed' && item.status !== 'failed'
        ));
        setShowClearDialog(false);
    };

    // Remove single item
    const removeItem = (id: string) => {
        setBatchItems(prev => prev.filter(item => item.id !== id));
    };

    // Get status badge styling
    const getStatusBadge = (status: BatchItem['status']) => {
        switch (status) {
            case 'completed':
                return {
                    icon: <CheckCircle className="h-4 w-4" />,
                    className: 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                };
            case 'failed':
                return {
                    icon: <XCircle className="h-4 w-4" />,
                    className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                };
            case 'analyzing':
            case 'uploading':
                return {
                    icon: <Clock className="h-4 w-4" />,
                    className: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                };
            default:
                return {
                    icon: <Clock className="h-4 w-4" />,
                    className: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                };
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Batch Processing</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload and analyze multiple documents at once
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowClearDialog(true)}
                        disabled={isProcessing || batchItems.length === 0}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Completed
                    </Button>
                    <Button
                        onClick={startProcessing}
                        disabled={isProcessing || batchItems.length === 0 || !selectedAnalysisType}
                    >
                        {isProcessing ? (
                            <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4 mr-2" />
                        )}
                        Start Processing
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Analysis Configuration</CardTitle>
                    <CardDescription>
                        Select the type of analysis to perform on all documents
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Select
                        value={selectedAnalysisType}
                        onValueChange={setSelectedAnalysisType}
                    >
                        <SelectTrigger className="w-full md:w-[300px]">
                            <SelectValue placeholder="Select analysis type" />
                        </SelectTrigger>
                        <SelectContent>
                            {analysisTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                    {type.name.replace(/_/g, ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Document Queue</CardTitle>
                        <CardDescription>
                            Upload documents or drag and drop them here
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed rounded-lg p-8 text-center mb-6"
                        >
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                className="hidden"
                                onChange={handleFileSelect}
                                accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center gap-2"
                            >
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    Click to upload or drag and drop files here
                                </p>
                            </label>
                        </div>

                        <ScrollArea className="h-[400px]">
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {batchItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className={cn(
                                                "p-4 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors",
                                                selectedItem?.id === item.id && "bg-accent"
                                            )}
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="font-medium">{item.file.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn(
                                                            'gap-1 capitalize',
                                                            getStatusBadge(item.status).className
                                                        )}
                                                    >
                                                        {getStatusBadge(item.status).icon}
                                                        {item.status}
                                                    </Badge>
                                                    {!isProcessing && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeItem(item.id);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            {item.progress > 0 && item.progress < 100 && (
                                                <Progress value={item.progress} className="mt-2" />
                                            )}
                                            {item.error && (
                                                <p className="text-sm text-red-500 mt-2">
                                                    {item.error}
                                                </p>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Preview Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Results Preview</CardTitle>
                        <CardDescription>
                            View analysis results for the selected document
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedItem?.document && selectedItem?.analysis ? (
                            <BatchResultPreview
                                document={selectedItem.document}
                                analysis={selectedItem.analysis}
                                onClose={() => setSelectedItem(null)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                                <FileText className="h-12 w-12 mb-4" />
                                <p>Select a completed item to view results</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear Completed Items</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to clear all completed and failed items from the queue?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearCompleted}>
                            Clear Items
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
