'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useToast } from '@/hooks/use-toast';
import { DocumentType } from '@/enums/document';
import { DocumentUpdate } from '@/types/document';
import { AnalysisStatus } from '@/enums/analysis';
import { AnalysisRunWithResults } from '@/types/analysis/base';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    DocumentPreview,
    DocumentHeader,
    DocumentDetails,
    DocumentStatsCards,
    DocumentTagsSection,
    DocumentVersionHistory,
    DocumentAnalysisList,
    DocumentTagsDialog,
    DeleteConfirmationDialog
} from '@/components/documents';
// Temporarily comment out the DocumentEditor import until it's available
// import { DocumentEditor } from '@/components/editors/document-editor';
import {
    DocumentIcon,
    XCircleIcon,
    ArrowPathIcon,
    ArrowLeftIcon,
    ChatBubbleLeftIcon,
    ShareIcon,
    BookmarkIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardAnalysis extends AnalysisRunWithResults {
    type: string;
    definition?: {
        name?: string;
        code?: string;
    };
}

interface DocumentPageProps {
    params: Promise<{
        documentId: string;
    }>;
}

// Temporary DocumentEditor component until the real one is available
const DocumentEditor = ({
    documentId,
    documentType,
    documentUrl,
    onSave,
    onClose
}: {
    documentId: string;
    documentType: any;
    documentUrl: string;
    onSave: (data: DocumentUpdate) => Promise<void>;
    onClose: () => void;
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
                <h2 className="text-xl font-bold mb-4">Edit Document</h2>
                <p className="mb-4">Document editor is not yet implemented.</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => onSave({ name: "Updated Document" })}>Save</Button>
                </div>
            </div>
        </div>
    );
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
    const [isBookmarked, setIsBookmarked] = useState(false);

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

    // Toggle bookmark status
    const toggleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        toast({
            description: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        });
    };

    // Cast analyses to DashboardAnalysis[]
    const dashboardAnalyses = analyses as DashboardAnalysis[];

    // Get analysis status summary
    const getAnalysisStatusSummary = () => {
        if (!dashboardAnalyses || dashboardAnalyses.length === 0) return null;

        const total = dashboardAnalyses.length;
        const completed = dashboardAnalyses.filter(a => a.status === AnalysisStatus.COMPLETED).length;
        const inProgress = dashboardAnalyses.filter(a => a.status === AnalysisStatus.IN_PROGRESS).length;
        const failed = dashboardAnalyses.filter(a => a.status === AnalysisStatus.FAILED).length;

        return {
            total,
            completed,
            inProgress,
            failed,
            progress: Math.round((completed / total) * 100)
        };
    };

    const analysisSummary = getAnalysisStatusSummary();

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading document details...</p>
                </div>
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

    return (
        <div className="space-y-6">
            {/* Document Header with Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">{currentDocument.name}</h1>
                        <Badge variant="outline" className="capitalize">
                            {currentDocument.type.toString()}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Uploaded {formatDistanceToNow(new Date(currentDocument.uploaded_at))} ago
                        {currentDocument.updated_at && currentDocument.updated_at !== currentDocument.uploaded_at &&
                            ` • Updated ${formatDistanceToNow(new Date(currentDocument.updated_at))} ago`}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {currentDocument.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                                {tag.name}
                            </Badge>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-5 px-2 text-xs rounded-full"
                            onClick={() => setIsTagDialogOpen(true)}
                        >
                            + Add Tag
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleBookmark}
                        className={isBookmarked ? "text-yellow-500 border-yellow-500" : ""}
                    >
                        <BookmarkIcon className="w-4 h-4 mr-2" />
                        {isBookmarked ? "Bookmarked" : "Bookmark"}
                    </Button>
                    <Button variant="outline" size="sm">
                        <ShareIcon className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(currentDocument.url, '_blank')}>
                        <ArrowPathIcon className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="px-2">
                                <EllipsisHorizontalIcon className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                Edit Document
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/analysis/${currentDocument.id}`)}>
                                Analyze Document
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                Delete Document
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Analysis Progress Summary (if analyses exist) */}
            {analysisSummary && (
                <Card className="p-4 border-none shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-medium">Analysis Progress</h3>
                            <p className="text-xs text-muted-foreground">
                                {analysisSummary.completed} of {analysisSummary.total} analyses completed
                            </p>
                        </div>
                        <div className="flex items-center gap-4 flex-1 max-w-md">
                            <Progress value={analysisSummary.progress} className="h-2" />
                            <span className="text-sm font-medium">{analysisSummary.progress}%</span>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setActiveTab('analysis')}
                            className="whitespace-nowrap"
                        >
                            View Analyses
                        </Button>
                    </div>
                </Card>
            )}

            {/* Document Preview and Details */}
            <div className="grid gap-6 md:grid-cols-[350px_1fr]">
                {/* Left Panel - Preview */}
                <div className="space-y-6">
                    <Card className="p-6 border-none shadow-sm">
                        <div className="aspect-[3/4] rounded-lg">
                            <DocumentPreview
                                url={currentDocument.url}
                                name={currentDocument.name}
                                type={currentDocument.type as unknown as DocumentType}
                            />
                        </div>
                    </Card>

                    <DocumentDetails
                        type={currentDocument.type as unknown as DocumentType}
                        uploadedAt={currentDocument.uploaded_at}
                        updatedAt={currentDocument.updated_at}
                        isArchived={currentDocument.is_archived}
                    />
                </div>

                {/* Right Panel - Details and Actions */}
                <div className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full grid grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="analysis">Analysis</TabsTrigger>
                            <TabsTrigger value="annotations">Annotations</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-6">
                            <DocumentStatsCards
                                size={currentDocument.size}
                                type={currentDocument.type as unknown as DocumentType}
                                pageCount={currentDocument.metadata?.pageCount}
                                updatedAt={currentDocument.updated_at}
                            />

                            <DocumentVersionHistory
                                versions={documentVersions}
                                onViewVersion={(versionId) => router.push(`/dashboard/documents/${versionId}`)}
                            />

                            {/* Recent Activity Section */}
                            <Card className="p-4 border-none shadow-sm">
                                <h4 className="text-sm font-medium text-muted-foreground mb-4">Recent Activity</h4>
                                <div className="space-y-4">
                                    {dashboardAnalyses.slice(0, 3).map((analysis) => (
                                        <div key={analysis.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${analysis.status === AnalysisStatus.COMPLETED ? 'bg-green-500' :
                                                    analysis.status === AnalysisStatus.IN_PROGRESS ? 'bg-yellow-500' :
                                                        analysis.status === AnalysisStatus.FAILED ? 'bg-red-500' : 'bg-blue-500'
                                                    }`} />
                                                <span>
                                                    {analysis.type === 'table_analysis' ? 'Table Analysis' :
                                                        analysis.type === 'text_analysis' ? 'Text Analysis' :
                                                            analysis.definition?.name || analysis.type || 'Analysis'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <Badge variant={
                                                analysis.status === AnalysisStatus.COMPLETED ? 'default' :
                                                    analysis.status === AnalysisStatus.IN_PROGRESS ? 'secondary' :
                                                        analysis.status === AnalysisStatus.FAILED ? 'destructive' : 'outline'
                                            }>
                                                {analysis.status}
                                            </Badge>
                                        </div>
                                    ))}
                                    {dashboardAnalyses.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No recent activity</p>
                                    )}
                                </div>
                                {dashboardAnalyses.length > 3 && (
                                    <Button
                                        variant="link"
                                        className="mt-2 p-0 h-auto"
                                        onClick={() => setActiveTab('analysis')}
                                    >
                                        View all activity
                                    </Button>
                                )}
                            </Card>
                        </TabsContent>

                        <TabsContent value="analysis" className="space-y-6 mt-6">
                            <DocumentAnalysisList
                                analyses={dashboardAnalyses}
                                onViewAnalysis={(analysisId) => router.push(`/dashboard/analysis/${analysisId}`)}
                                onStartAnalysis={() => router.push(`/dashboard/analysis/${currentDocument.id}`)}
                                documentId={currentDocument.id}
                            />
                        </TabsContent>

                        <TabsContent value="annotations" className="space-y-6 mt-6">
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
            <DocumentTagsDialog
                isOpen={isTagDialogOpen}
                onClose={() => setIsTagDialogOpen(false)}
                tags={tags}
                selectedTags={selectedTags}
                onTagsChange={async (tagIds) => {
                    setSelectedTags(new Set(tagIds));
                }}
                onSave={handleUpdateTags}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                documentName={currentDocument.name}
            />

            {/* Document Editor Dialog */}
            {isEditing && (
                <DocumentEditor
                    documentId={currentDocument.id}
                    documentType={currentDocument.type as unknown as DocumentType}
                    documentUrl={currentDocument.url}
                    onSave={handleSaveEdit}
                    onClose={() => setIsEditing(false)}
                />
            )}
        </div>
    );
}
