'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useToast } from '@/hooks/use-toast';
import { Document, DocumentType, AnalysisStatus, DocumentWithAnalysis } from '@/types/document';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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

export default function DocumentPage({ params }: DocumentPageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { getDocument, deleteDocument } = useDocumentStore();
    const [document, setDocument] = useState<DocumentWithAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);

    // Unwrap the params promise
    const { documentId } = use(params);

    useEffect(() => {
        const loadDocument = async () => {
            try {
                const doc = await getDocument(documentId);
                setDocument(doc);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load document",
                    variant: "destructive",
                });
                router.push('/dashboard/documents');
            } finally {
                setIsLoading(false);
            }
        };

        loadDocument();
    }, [documentId, getDocument, router, toast]);

    const handleDelete = async () => {
        if (!document) return;

        try {
            await deleteDocument(document.id);
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

    const handleSaveEdit = async (data: any) => {
        try {
            // Implement save functionality
            // await documentService.updateDocument(document.id, data);
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

    if (!document) {
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
                        <DocumentTypeIcon type={document.type} className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{document.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {document.uploaded_at ?
                                `Uploaded ${formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}` :
                                'Recently uploaded'
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(document.url, '_blank')}>
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
                                <DocumentTypeIcon type={document.type} className="h-16 w-16 text-muted-foreground/50" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Document Info</h3>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Type</dt>
                                        <dd className="font-medium">{document.type}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Size</dt>
                                        <dd className="font-medium">{(document.size / 1024 / 1024).toFixed(2)} MB</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Created</dt>
                                        <dd className="font-medium">{formatDate(document.created_at)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Last Modified</dt>
                                        <dd className="font-medium">{formatDate(document.updated_at)}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Analysis Status</h3>
                                <div className="space-y-3">
                                    <Badge
                                        variant={document.status === AnalysisStatus.COMPLETED ? 'default' : 'secondary'}
                                        className="w-full justify-center"
                                    >
                                        {document.status}
                                    </Badge>
                                    {document.status === AnalysisStatus.PROCESSING && (
                                        <Progress value={33} className="h-2" />
                                    )}
                                </div>
                            </div>

                            {document.status === AnalysisStatus.PENDING && (
                                <Button className="w-full" onClick={() => router.push(`/dashboard/analysis/${document.id}`)}>
                                    <ChartBarIcon className="w-4 h-4 mr-2" />
                                    Start Analysis
                                </Button>
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
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Word Count</h4>
                                    <p className="text-2xl font-bold">{document.metadata?.wordCount || 'N/A'}</p>
                                </Card>
                                <Card className="p-4">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Pages</h4>
                                    <p className="text-2xl font-bold">{document.metadata?.pageCount || 'N/A'}</p>
                                </Card>
                                <Card className="p-4">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Characters</h4>
                                    <p className="text-2xl font-bold">{document.metadata?.characterCount || 'N/A'}</p>
                                </Card>
                            </div>

                            <Card className="p-4">
                                <h4 className="text-sm font-medium text-muted-foreground mb-4">Quick Summary</h4>
                                <p className="text-sm text-muted-foreground">
                                    {document.metadata?.summary || 'No summary available. Start an analysis to generate insights about this document.'}
                                </p>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analysis" className="space-y-6">
                            {document.status === AnalysisStatus.COMPLETED ? (
                                <div className="space-y-6">
                                    <Card className="p-4">
                                        <h4 className="text-sm font-medium text-muted-foreground mb-4">Analysis Results</h4>
                                        {/* Add analysis results visualization here */}
                                        <p className="text-sm text-muted-foreground">Analysis results will be displayed here.</p>
                                    </Card>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ChartBarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                    <h3 className="mt-4 text-lg font-semibold">No Analysis Available</h3>
                                    <p className="text-muted-foreground mb-4">Run an analysis to see insights about this document</p>
                                    <Button onClick={() => router.push(`/dashboard/analysis/${document.id}`)}>
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
                                {document.annotations?.length ? (
                                    document.annotations.map((annotation, index) => (
                                        <Card key={index} className="p-4">
                                            <div className="flex items-start gap-3">
                                                <UserCircleIcon className="w-8 h-8 text-muted-foreground/50" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{annotation.user}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {annotation.created_at ?
                                                                    formatDistanceToNow(new Date(annotation.created_at), { addSuffix: true }) :
                                                                    'Recently added'
                                                                }
                                                            </p>
                                                        </div>
                                                        <Button variant="ghost" size="icon">
                                                            <TagIcon className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="mt-2 text-sm">{annotation.content}</p>
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
            {isEditing && document && (
                <DocumentEditor
                    documentId={document.id}
                    documentType={document.type}
                    documentUrl={document.url}
                    onSave={handleSaveEdit}
                    onClose={() => setIsEditing(false)}
                />
            )}
        </div>
    );
}
