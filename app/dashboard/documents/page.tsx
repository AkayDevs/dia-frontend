'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentType, AnalysisStatus, Document } from '@/services/document.service';
import { documentService } from '@/services/document.service';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
    ChevronDownIcon,
    DocumentIcon,
    DocumentTextIcon,
    DocumentChartBarIcon,
    PhotoIcon,
    TrashIcon,
    PencilIcon,
    EyeIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

const DocumentTypeIcon = ({ type }: { type: DocumentType }) => {
    switch (type) {
        case DocumentType.PDF:
            return <DocumentIcon className="h-5 w-5 text-blue-500" />;
        case DocumentType.DOCX:
            return <DocumentTextIcon className="h-5 w-5 text-indigo-500" />;
        case DocumentType.XLSX:
            return <DocumentChartBarIcon className="h-5 w-5 text-green-500" />;
        case DocumentType.IMAGE:
            return <PhotoIcon className="h-5 w-5 text-purple-500" />;
        default:
            return <DocumentIcon className="h-5 w-5 text-gray-500" />;
    }
};

const StatusBadge = ({ status }: { status: AnalysisStatus }) => {
    const getStatusStyles = () => {
        switch (status) {
            case AnalysisStatus.PENDING:
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case AnalysisStatus.PROCESSING:
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case AnalysisStatus.COMPLETED:
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case AnalysisStatus.FAILED:
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center ${getStatusStyles()}`}>
            {status === AnalysisStatus.PROCESSING && (
                <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
            )}
            {status.toLowerCase()}
        </span>
    );
};

export default function DocumentsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { token } = useAuthStore();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<AnalysisStatus | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const skip = (currentPage - 1) * ITEMS_PER_PAGE;
            const status = statusFilter === 'ALL' ? undefined : statusFilter;
            const docs = await documentService.getDocuments({
                skip,
                limit: ITEMS_PER_PAGE,
                status,
            });
            setDocuments(docs);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch documents. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDocuments();
        }
    }, [token, currentPage, statusFilter]);

    const handleDelete = async (documentId: string) => {
        try {
            await documentService.deleteDocument(documentId);
            toast({
                description: "Document deleted successfully",
                duration: 3000,
            });
            fetchDocuments();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete document. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleAnalyze = async (documentId: string) => {
        try {
            await documentService.analyzeDocument(documentId, {
                type: 'default',
                parameters: {},
            });
            toast({
                description: "Analysis started successfully",
                duration: 3000,
            });
            fetchDocuments();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to start analysis. Please try again.",
                variant: "destructive",
            });
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                    <p className="text-muted-foreground">
                        Manage and analyze your documents
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/dashboard/upload')}
                    size="lg"
                    className="w-full md:w-auto"
                >
                    Upload Document
                </Button>
            </div>

            <Card className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <Input
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-[300px]"
                        />
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as AnalysisStatus | 'ALL')}
                        >
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value={AnalysisStatus.PENDING}>Pending</SelectItem>
                                <SelectItem value={AnalysisStatus.PROCESSING}>Processing</SelectItem>
                                <SelectItem value={AnalysisStatus.COMPLETED}>Completed</SelectItem>
                                <SelectItem value={AnalysisStatus.FAILED}>Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <ArrowPathIcon className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="text-center py-8">
                        <DocumentIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
                        <p className="text-muted-foreground">
                            {searchQuery
                                ? "No documents match your search criteria"
                                : "Upload a document to get started"}
                        </p>
                    </div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Uploaded</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDocuments.map((document, index) => (
                                    <TableRow key={document.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <DocumentTypeIcon type={document.type} />
                                                <span className="truncate max-w-[300px]">
                                                    {document.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{document.type}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={document.status} />
                                        </TableCell>
                                        <TableCell>
                                            {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <ChevronDownIcon className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/dashboard/documents/${document.id}`)}
                                                    >
                                                        <EyeIcon className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {document.status !== AnalysisStatus.PROCESSING && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleAnalyze(document.id)}
                                                        >
                                                            <ArrowPathIcon className="mr-2 h-4 w-4" />
                                                            Analyze
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="text-red-600 dark:text-red-400"
                                                        onClick={() => handleDelete(document.id)}
                                                    >
                                                        <TrashIcon className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {documents.length > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {Math.min(ITEMS_PER_PAGE, filteredDocuments.length)} of {documents.length} documents
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={documents.length < ITEMS_PER_PAGE}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
} 