'use client';

import { useEffect, useState, use } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useToast } from '@/hooks/use-toast';
import { Document, DocumentType, DocumentWithAnalysis, DocumentUpdate } from '@/types/document';
import { AnalysisStatus } from '@/types/analysis_configs';
import { AnalysisRunWithResults } from '@/types/analysis_execution';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';
import {
    DocumentIcon,
    DocumentTextIcon,
    DocumentChartBarIcon,
    PhotoIcon,
    TrashIcon,
    PencilIcon,
    ShareIcon,
    ArrowDownTrayIcon,
    ChartBarIcon,
    ChatBubbleLeftIcon,
    TagIcon,
    UserCircleIcon,
    ClockIcon,
    TableCellsIcon,
    DocumentDuplicateIcon,
    XMarkIcon,
    PlusIcon,
    CheckIcon,
    ArrowPathIcon,
    XCircleIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { DocumentEditor } from '@/components/editors/document-editor';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface DashboardAnalysis extends AnalysisRunWithResults {
    type: string;
}

interface DocumentPageProps {
    params: Promise<{
        documentId: string;
    }>;
}

// Document type icon mapping
const DocumentTypeIcon = ({ type, className = "h-5 w-5" }: { type: DocumentType; className?: string }) => {
    const icons: Record<DocumentType, JSX.Element> = {
        [DocumentType.PDF]: <DocumentIcon className={`${className} text-blue-500`} />,
        [DocumentType.DOCX]: <DocumentTextIcon className={`${className} text-indigo-500`} />,
        [DocumentType.XLSX]: <DocumentChartBarIcon className={`${className} text-green-500`} />,
        [DocumentType.IMAGE]: <PhotoIcon className={`${className} text-purple-500`} />,
        [DocumentType.UNKNOWN]: <DocumentIcon className={`${className} text-gray-500`} />
    };
    return icons[type];
};

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return format(date, 'PP');
    } catch (error) {
        return 'N/A';
    }
};

const getLatestAnalysis = (analyses: AnalysisRunWithResults[]): AnalysisRunWithResults | undefined => {
    return analyses.length > 0
        ? analyses.reduce((latest, current) =>
            new Date(current.created_at) > new Date(latest.created_at) ? current : latest
        )
        : undefined;
};

export default function DocumentPage({ params }: DocumentPageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const {
        currentDocument,
        isLoading,
        error,
        fetchDocument,
        clearError,
        deleteDocument,
        updateDocument,
        fetchDocumentVersions,
        documentVersions,
        updateDocumentTags,
        tags,
        fetchTags
    } = useDocumentStore();
    const {
        analyses,
        fetchDocumentAnalyses,
    } = useAnalysisStore();
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set());
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Unwrap the params promise
    const { documentId } = use(params);

    // Initialize selectedTags when document changes
    useEffect(() => {
        if (currentDocument) {
            setSelectedTags(new Set(currentDocument.tags.map(tag => tag.id)));
        }
    }, [currentDocument]);

    // Reset state when documentId changes
    useEffect(() => {
        setActiveTab('overview');
        setIsEditing(false);
        clearError();
    }, [documentId, clearError]);

    // Fetch document and related data when documentId changes
    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchDocument(documentId),
                    fetchDocumentAnalyses(documentId),
                    fetchTags(),
                    fetchDocumentVersions(documentId)
                ]);
            } catch (error) {
                console.error('Error loading document details:', error);
            }
        };

        loadData();

        // Cleanup function
        return () => {
            clearError();
        };
    }, [documentId, fetchDocument, fetchDocumentAnalyses, fetchTags, fetchDocumentVersions, clearError]);

    // Handle tag updates
    const handleUpdateTags = async () => {
        if (!currentDocument) return;

        try {
            await updateDocumentTags(currentDocument.id, Array.from(selectedTags));
            setIsTagDialogOpen(false);
            toast({
                description: "Tags updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update tags",
                variant: "destructive",
            });
        }
    };

    // Handle document deletion
    const handleDeleteConfirm = async () => {
        if (!currentDocument) return;

        try {
            await deleteDocument(currentDocument.id);
            toast({
                description: "Document deleted successfully",
            });
            router.push('/dashboard/documents');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete document",
                variant: "destructive",
            });
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    // Handle document edit save
    const handleSaveEdit = async (data: DocumentUpdate) => {
        if (!currentDocument) return;

        try {
            await updateDocument(currentDocument.id, data);
            toast({
                description: "Document updated successfully",
            });
            setIsEditing(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update document",
                variant: "destructive",
            });
        }
    };

    // Cast analyses to DashboardAnalysis[]
    const dashboardAnalyses = analyses as DashboardAnalysis[];

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <XCircleIcon className="w-12 h-12 text-destructive" />
                <h2 className="text-lg font-semibold">Error Loading Document</h2>
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={() => fetchDocument(documentId)}>
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    // Not found state
    if (!currentDocument) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <DocumentIcon className="w-12 h-12 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Document Not Found</h2>
                <p className="text-muted-foreground">The document you're looking for doesn't exist or has been deleted.</p>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/documents">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Documents
                    </Link>
                </Button>
            </div>
        );
    }

    // Document preview section
    const renderDocumentPreview = () => {
        const previewContainerClass = "h-full flex items-center justify-center p-4 bg-muted/50 rounded-lg";

        switch (currentDocument.type) {
            case DocumentType.PDF:
                return (
                    <div className={previewContainerClass}>
                        <object
                            data={`${currentDocument.url}#toolbar=0`}
                            type="application/pdf"
                            className="w-full h-full rounded-lg"
                        >
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <DocumentIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">PDF preview not available</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => window.open(currentDocument.url, '_blank')}
                                    >
                                        Open PDF
                                    </Button>
                                </div>
                            </div>
                        </object>
                    </div>
                );

            case DocumentType.IMAGE:
                return (
                    <div className={previewContainerClass}>
                        <img
                            src={currentDocument.url}
                            alt={currentDocument.name}
                            className="max-w-full max-h-full object-contain rounded-lg"
                            loading="lazy"
                        />
                    </div>
                );

            case DocumentType.DOCX:
                return (
                    <div className={previewContainerClass}>
                        <div className="text-center">
                            <DocumentTextIcon className="h-16 w-16 text-indigo-500 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Word document preview</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => window.open(currentDocument.url, '_blank')}
                            >
                                Open Document
                            </Button>
                        </div>
                    </div>
                );

            case DocumentType.XLSX:
                return (
                    <div className={previewContainerClass}>
                        <div className="text-center">
                            <DocumentChartBarIcon className="h-16 w-16 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Excel file preview</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => window.open(currentDocument.url, '_blank')}
                            >
                                Open Spreadsheet
                            </Button>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className={previewContainerClass}>
                        <div className="text-center">
                            <DocumentIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Preview not available</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => window.open(currentDocument.url, '_blank')}
                            >
                                Open File
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Document Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">{currentDocument.name}</h2>
                    <p className="text-sm text-muted-foreground">
                        Uploaded {formatDistanceToNow(new Date(currentDocument.uploaded_at))} ago
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(currentDocument.url, '_blank')}>
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Document Preview and Details */}
            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                {/* Left Panel - Preview */}
                <Card className="p-6">
                    <div className="aspect-[3/4] rounded-lg">
                        {renderDocumentPreview()}
                    </div>
                </Card>

                {/* Right Panel - Details and Actions */}
                <div className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="analysis">Analysis</TabsTrigger>
                            <TabsTrigger value="annotations">Annotations</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card className="p-4">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">File Size</h4>
                                    <p className="text-2xl font-bold">{(currentDocument.size / 1024 / 1024).toFixed(2)} MB</p>
                                </Card>
                                <Card className="p-4">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Pages</h4>
                                    <p className="text-2xl font-bold">
                                        {currentDocument.type === DocumentType.PDF || currentDocument.type === DocumentType.DOCX ?
                                            currentDocument.metadata?.pageCount || '1' :
                                            '1'
                                        }
                                    </p>
                                </Card>
                                <Card className="p-4">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Last Modified</h4>
                                    <p className="text-2xl font-bold">
                                        {currentDocument.updated_at ?
                                            formatDistanceToNow(new Date(currentDocument.updated_at), { addSuffix: true }) :
                                            'Recently'
                                        }
                                    </p>
                                </Card>
                            </div>

                            <Card className="p-4">
                                <h4 className="text-sm font-medium text-muted-foreground mb-4">Document Details</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">File Type</span>
                                        <span className="text-sm font-medium">{currentDocument.type.toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Upload Date</span>
                                        <span className="text-sm font-medium">{formatDate(currentDocument.uploaded_at)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <span className="text-sm font-medium">
                                            {currentDocument.is_archived ? 'Archived' : 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                                    <Button variant="outline" size="sm" onClick={() => setIsTagDialogOpen(true)}>
                                        <TagIcon className="w-4 h-4 mr-2" />
                                        Manage Tags
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentDocument.tags.map((tag) => (
                                        <Badge key={tag.id} variant="secondary">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                    {currentDocument.tags.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No tags added</p>
                                    )}
                                </div>
                            </Card>

                            {documentVersions.length > 0 && (
                                <Card className="p-4">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-4">Version History</h4>
                                    <div className="space-y-3">
                                        {documentVersions.map((version) => (
                                            <div
                                                key={version.id}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span>{formatDistanceToNow(new Date(version.uploaded_at), { addSuffix: true })}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/dashboard/documents/${version.id}`)}
                                                >
                                                    View
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="analysis" className="space-y-6">
                            {dashboardAnalyses.length > 0 ? (
                                <div className="space-y-6">
                                    {dashboardAnalyses.map((analysis) => (
                                        <Card key={analysis.id} className="p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="text-sm font-medium">
                                                        {analysis.type === 'table_analysis' ? (
                                                            <div className="flex items-center gap-2">
                                                                <TableCellsIcon className="w-4 h-4" />
                                                                Table Analysis
                                                            </div>
                                                        ) : analysis.type === 'text_analysis' ? (
                                                            <div className="flex items-center gap-2">
                                                                <DocumentTextIcon className="w-4 h-4" />
                                                                Text Analysis
                                                            </div>
                                                        ) : (
                                                            analysis.type
                                                        )}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {analysis.status === AnalysisStatus.COMPLETED && analysis.completed_at ?
                                                            `Completed ${formatDistanceToNow(new Date(analysis.completed_at), { addSuffix: true })}` :
                                                            `Status: ${analysis.status}`
                                                        }
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/dashboard/analysis/${analysis.id}`)}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                            {analysis.status === AnalysisStatus.IN_PROGRESS && (
                                                <Progress value={33} className="h-2 mt-2" />
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ChartBarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                    <h3 className="mt-4 text-lg font-semibold">No Analysis Available</h3>
                                    <p className="text-muted-foreground mb-4">Run an analysis to see insights about this document</p>
                                    <Button onClick={() => router.push(`/dashboard/analysis/${currentDocument.id}`)}>
                                        Start Analysis
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="annotations" className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-muted-foreground">Annotations & Comments</h4>
                                <Button variant="outline" size="sm">
                                    <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                                    Add Comment
                                </Button>
                            </div>
                            <div className="text-center py-8">
                                <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-semibold">No Annotations Yet</h3>
                                <p className="text-muted-foreground">Add comments or annotations to collaborate with others</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Tag Management Dialog */}
            <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Document Tags</DialogTitle>
                        <DialogDescription>
                            Select or remove tags for this document
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2">
                        {tags.map((tag) => (
                            <div
                                key={tag.id}
                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedTags.has(tag.id)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80'
                                    }`}
                                onClick={() => {
                                    const newSelectedTags = new Set(selectedTags);
                                    if (newSelectedTags.has(tag.id)) {
                                        newSelectedTags.delete(tag.id);
                                    } else {
                                        newSelectedTags.add(tag.id);
                                    }
                                    setSelectedTags(newSelectedTags);
                                }}
                            >
                                <span>{tag.name}</span>
                                {selectedTags.has(tag.id) ? (
                                    <CheckIcon className="w-4 h-4" />
                                ) : (
                                    <PlusIcon className="w-4 h-4" />
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter className="flex justify-between items-center">
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedTags(new Set())}
                        >
                            Clear All
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsTagDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateTags}>
                                Save Changes
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Document</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{currentDocument.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Document Editor Dialog */}
            {isEditing && (
                <DocumentEditor
                    documentId={currentDocument.id}
                    documentType={currentDocument.type}
                    documentUrl={currentDocument.url}
                    onSave={handleSaveEdit}
                    onClose={() => setIsEditing(false)}
                />
            )}
        </div>
    );
}
