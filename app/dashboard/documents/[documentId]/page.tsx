'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useToast } from '@/hooks/use-toast';
import { Document, DocumentType, DocumentWithAnalysis, DocumentUpdate } from '@/types/document';
import { Analysis, AnalysisStatus, AnalysisTypeEnum } from '@/types/analysis';
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
} from '@heroicons/react/24/outline';
import { DocumentEditor } from '@/components/editors/document-editor';

interface DocumentPageProps {
    params: Promise<{
        documentId: string;
    }>;
}

// Document type icon mapping (reused from documents page)
const DocumentTypeIcon = ({ type, className = "h-5 w-5" }: { type: DocumentType; className?: string }) => {
    const icons = {
        [DocumentType.PDF]: <DocumentIcon className={`${className} text-blue-500`} />,
        [DocumentType.DOCX]: <DocumentTextIcon className={`${className} text-indigo-500`} />,
        [DocumentType.XLSX]: <DocumentChartBarIcon className={`${className} text-green-500`} />,
        [DocumentType.IMAGE]: <PhotoIcon className={`${className} text-purple-500`} />
    };
    return icons[type] || <DocumentIcon className={`${className} text-gray-500`} />;
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

const getLatestAnalysis = (analyses: Analysis[]): Analysis | undefined => {
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
        fetchDocument,
        updateDocument,
        deleteDocument,
        fetchDocumentVersions,
        documentVersions,
        updateDocumentTags,
        tags,
        fetchTags,
        currentDocument,
    } = useDocumentStore();
    const {
        analyses,
        fetchDocumentAnalyses,
        isLoading: isLoadingAnalyses,
    } = useAnalysisStore();

    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set());

    // Unwrap the params promise
    const { documentId } = use(params);

    // Latest analysis for the document
    const latestAnalysis = getLatestAnalysis(analyses);
    const analysisStatus = latestAnalysis?.status || AnalysisStatus.PENDING;

    // Initialize selectedTags when document changes
    useEffect(() => {
        if (currentDocument) {
            setSelectedTags(new Set(currentDocument.tags.map(tag => tag.id)));
        }
    }, [currentDocument]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                await Promise.all([
                    fetchDocument(documentId),
                    fetchDocumentAnalyses(documentId),
                    fetchTags(),
                    fetchDocumentVersions(documentId)
                ]);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load document details",
                    variant: "destructive",
                });
                router.push('/dashboard/documents');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [documentId, fetchDocument, fetchDocumentAnalyses, fetchTags, fetchDocumentVersions, toast, router]);

    const handleDelete = async () => {
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
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

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

    if (!currentDocument) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
                <DocumentIcon className="w-12 h-12 text-muted-foreground/50" />
                <h2 className="mt-4 text-lg font-semibold">Document not found</h2>
                <p className="text-muted-foreground">This document may have been deleted or moved</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push('/dashboard/documents')}
                >
                    Back to Documents
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <DocumentTypeIcon type={currentDocument.type} className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{currentDocument.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {currentDocument.uploaded_at ?
                                `Uploaded ${formatDistanceToNow(new Date(currentDocument.uploaded_at), { addSuffix: true })}` :
                                'Recently uploaded'
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(currentDocument.url, '_blank')}>
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                    <Button variant="outline" size="sm">
                        <ShareIcon className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                {/* Left Panel - Summary */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="aspect-[3/4] rounded-lg border bg-muted/50 mb-6">
                            {/* Document Preview/Thumbnail */}
                            <div className="flex items-center justify-center h-full">
                                <DocumentTypeIcon type={currentDocument.type} className="h-16 w-16 text-muted-foreground/50" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Document Info</h3>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Type</dt>
                                        <dd className="font-medium">{currentDocument.type}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Size</dt>
                                        <dd className="font-medium">{(currentDocument.size / 1024 / 1024).toFixed(2)} MB</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Uploaded</dt>
                                        <dd className="font-medium">{formatDate(currentDocument.uploaded_at)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Last Modified</dt>
                                        <dd className="font-medium">{formatDate(currentDocument.updated_at)}</dd>
                                    </div>
                                    {currentDocument.is_archived && (
                                        <>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Archived</dt>
                                                <dd className="font-medium">{formatDate(currentDocument.archived_at)}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Retention Until</dt>
                                                <dd className="font-medium">{formatDate(currentDocument.retention_until)}</dd>
                                            </div>
                                        </>
                                    )}
                                </dl>
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Analysis Status</h3>
                                <div className="space-y-3">
                                    <Badge
                                        variant={analysisStatus === AnalysisStatus.COMPLETED ? 'default' : 'secondary'}
                                        className="w-full justify-center"
                                    >
                                        {analysisStatus}
                                    </Badge>
                                    {analysisStatus === AnalysisStatus.PROCESSING && (
                                        <Progress value={33} className="h-2" />
                                    )}
                                </div>
                            </div>

                            {analysisStatus === AnalysisStatus.PENDING && (
                                <Button className="w-full" onClick={() => router.push(`/dashboard/analysis/${currentDocument.id}`)}>
                                    <ChartBarIcon className="w-4 h-4 mr-2" />
                                    Start Analysis
                                </Button>
                            )}

                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setIsTagDialogOpen(true)}>
                                        <TagIcon className="w-4 h-4" />
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
                            </div>

                            {documentVersions.length > 0 && (
                                <div className="pt-4 border-t">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Version History</h3>
                                    <div className="space-y-2">
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
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Panel - Tabs */}
                <Card className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
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
                                        <span className="text-sm font-medium">{currentDocument.type}</span>
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
                        </TabsContent>

                        <TabsContent value="analysis" className="space-y-6">
                            {analysisStatus === AnalysisStatus.COMPLETED ? (
                                <div className="space-y-6">
                                    {analyses.map((analysis) => (
                                        <Card key={analysis.id} className="p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="text-sm font-medium">
                                                        {analysis.analysis_type_id === AnalysisTypeEnum.TABLE_DETECTION ? (
                                                            <div className="flex items-center gap-2">
                                                                <TableCellsIcon className="w-4 h-4" />
                                                                Table Analysis
                                                            </div>
                                                        ) : analysis.analysis_type_id === AnalysisTypeEnum.TEXT_EXTRACTION ? (
                                                            <div className="flex items-center gap-2">
                                                                <DocumentTextIcon className="w-4 h-4" />
                                                                Text Analysis
                                                            </div>
                                                        ) : (
                                                            analysis.analysis_type_id
                                                        )}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        Completed {formatDistanceToNow(new Date(analysis.completed_at!), { addSuffix: true })}
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
                                            <div className="space-y-4">
                                                {analysis.step_results.map((step) => (
                                                    <div key={step.id} className="border rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="text-sm font-medium">{step.step_id}</h5>
                                                            <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                                                                {step.status}
                                                            </Badge>
                                                        </div>
                                                        {step.result && (
                                                            <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                                                                {JSON.stringify(step.result, null, 2)}
                                                            </pre>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
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

                            <div className="space-y-4">
                                {currentDocument.analyses.length > 0 ? (
                                    currentDocument.analyses.map((analysis) => (
                                        <Card key={analysis.id} className="p-4">
                                            <div className="flex items-start gap-3">
                                                <UserCircleIcon className="w-8 h-8 text-muted-foreground/50" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">Analysis Result</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                                                            </p>
                                                        </div>
                                                        <Button variant="ghost" size="icon">
                                                            <TagIcon className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="mt-2 text-sm">
                                                        Analysis type: {analysis.analysis_type_id}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                        <h3 className="mt-4 text-lg font-semibold">No Annotations Yet</h3>
                                        <p className="text-muted-foreground">Add comments or annotations to collaborate with others</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>
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

            {isEditing && currentDocument && (
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
