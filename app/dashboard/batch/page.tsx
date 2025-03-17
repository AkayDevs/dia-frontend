'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import {
    Upload,
    FileText,
    Trash2,
    Play,
    RotateCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AnalysisMode } from '@/enums/analysis';
import { BatchItem } from '@/components/batch/batch-item';
import { BatchUploadZone } from '@/components/batch/batch-upload-zone';
import { BatchConfig } from '@/components/batch/batch-config';
import { BatchResultPreview } from '@/components/batch/batch-result-preview';
import { batchService, BatchProcessItem, BatchProcessOptions } from '@/services/batch.service';
import { analysisService } from '@/services/analysis.service';
import { useDocumentStore } from '@/store/useDocumentStore';
import { Document } from '@/types/document';

export default function BatchPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { logout } = useAuthStore();
    const { analysisDefinitions, fetchAnalysisDefinitions, isLoading: isAnalysisLoading } = useAnalysisStore();

    // State
    const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
    const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<BatchItem | null>(null);
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(AnalysisMode.AUTOMATIC);
    const [notifyOnCompletion, setNotifyOnCompletion] = useState<boolean>(true);
    const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);

    // Fetch analysis definitions on mount
    useEffect(() => {
        fetchAnalysisDefinitions().catch(error => {
            const message = error instanceof Error ? error.message : 'Failed to fetch analysis definitions';
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
    }, [fetchAnalysisDefinitions, logout, router, toast]);

    // Handle file selection
    const handleFilesSelected = useCallback((files: File[]) => {
        const newItems: BatchItem[] = files.map(file => ({
            id: uuidv4(),
            file,
            status: 'pending',
            progress: 0
        }));
        setBatchItems(prev => [...prev, ...newItems]);
    }, []);

    // Handle document selection
    const handleDocumentsSelected = useCallback((documents: Document[]) => {
        setSelectedDocuments(documents);
    }, []);

    // Add selected documents to batch items
    const addSelectedDocumentsToBatch = useCallback(() => {
        if (selectedDocuments.length === 0) return;

        // Create batch items from selected documents
        const newItems: BatchItem[] = selectedDocuments.map(doc => ({
            id: uuidv4(),
            file: new File([], doc.name), // Placeholder file object
            document: doc, // Use the existing document
            status: 'pending',
            progress: 0
        }));

        setBatchItems(prev => [...prev, ...newItems]);
        toast({
            title: "Documents Added",
            description: `Added ${selectedDocuments.length} documents to the batch queue`,
        });

        // Clear selected documents
        setSelectedDocuments([]);
    }, [selectedDocuments, toast]);

    // Update a single batch item
    const updateBatchItem = useCallback((id: string, updates: Partial<BatchItem>) => {
        setBatchItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    }, []);

    // Process a single item
    const processItem = useCallback(async (item: BatchItem): Promise<BatchItem> => {
        try {
            // If item already has a document, skip upload
            if (item.document) {
                // Create options
                const options: BatchProcessOptions = {
                    analysisCode: selectedAnalysisId,
                    mode: analysisMode,
                    notifyOnCompletion
                };

                // Update progress to analyzing (66%)
                updateBatchItem(item.id, {
                    progress: 66,
                    status: 'analyzing'
                });

                // Start analysis directly
                const analysisId = await analysisService.startAnalysis(
                    item.document.id,
                    options.analysisCode,
                    options.mode
                );

                // Fetch analysis details
                const analysis = await analysisService.getAnalysis(analysisId.id || '');

                // Update progress to completed (100%)
                return {
                    ...item,
                    analysis,
                    status: 'completed',
                    progress: 100
                };
            }

            // Otherwise, process as normal with file upload
            const processItem: BatchProcessItem = {
                file: item.file,
                status: item.status,
                progress: item.progress,
                error: item.error
            };

            // Create options
            const options: BatchProcessOptions = {
                analysisCode: selectedAnalysisId,
                mode: analysisMode,
                notifyOnCompletion
            };

            // Process the item
            const result = await batchService.processItem(
                processItem,
                options,
                (progress) => {
                    updateBatchItem(item.id, {
                        progress,
                        status: progress < 50 ? 'uploading' : 'analyzing'
                    });
                }
            );

            // Return the updated item
            return {
                ...item,
                document: result.document,
                analysis: result.analysis,
                status: result.status,
                progress: result.progress,
                error: result.error
            };
        } catch (error) {
            return {
                ...item,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Processing failed',
                progress: 0
            };
        }
    }, [selectedAnalysisId, analysisMode, notifyOnCompletion, updateBatchItem]);

    // Start batch processing
    const startProcessing = async () => {
        if (!selectedAnalysisId) {
            toast({
                title: "Error",
                description: "Please select an analysis type",
                variant: "destructive",
            });
            return;
        }

        // Add any selected documents to the batch first
        if (selectedDocuments.length > 0) {
            addSelectedDocumentsToBatch();
        }

        setIsProcessing(true);
        const pendingItems = batchItems.filter(item => item.status === 'pending');

        try {
            // Process items sequentially
            for (const item of pendingItems) {
                const result = await processItem(item);
                updateBatchItem(item.id, result);
            }

            toast({
                title: "Success",
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
        setSelectedItem(null);
    };

    // Remove single item
    const removeItem = (id: string) => {
        setBatchItems(prev => prev.filter(item => item.id !== id));
        if (selectedItem?.id === id) {
            setSelectedItem(null);
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
                        disabled={isProcessing || (batchItems.length === 0 && selectedDocuments.length === 0) || !selectedAnalysisId}
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

            <BatchConfig
                analysisDefinitions={analysisDefinitions}
                selectedAnalysisId={selectedAnalysisId}
                isLoading={isAnalysisLoading || isProcessing}
                onAnalysisChange={setSelectedAnalysisId}
                onStartProcessing={startProcessing}
                onDocumentsSelected={handleDocumentsSelected}
                selectedDocuments={selectedDocuments}
                disabled={isProcessing}
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <BatchUploadZone
                        onFilesSelected={handleFilesSelected}
                        disabled={isProcessing}
                    />

                    <ScrollArea className="h-[500px] border rounded-lg p-4">
                        <div className="space-y-4">
                            <AnimatePresence>
                                {batchItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                                        <Upload className="h-12 w-12 mb-4 opacity-20" />
                                        <p>No documents in the queue</p>
                                        <p className="text-sm mt-2">
                                            Upload documents or select existing ones to start batch processing
                                        </p>
                                    </div>
                                ) : (
                                    batchItems.map((item) => (
                                        <BatchItem
                                            key={item.id}
                                            item={item}
                                            isSelected={selectedItem?.id === item.id}
                                            isProcessing={isProcessing}
                                            onSelect={setSelectedItem}
                                            onRemove={removeItem}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </div>

                {/* Preview Section */}
                <div>
                    {selectedItem?.document && selectedItem?.analysis ? (
                        <BatchResultPreview
                            document={selectedItem.document}
                            analysis={selectedItem.analysis}
                            onClose={() => setSelectedItem(null)}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg text-muted-foreground">
                            <FileText className="h-12 w-12 mb-4 opacity-20" />
                            <p>Select a completed item to view results</p>
                        </div>
                    )}
                </div>
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
