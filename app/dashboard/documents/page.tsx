'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentType } from '@/types/document';
import { AnalysisStatus } from '@/lib/enums';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
    DropdownMenuSeparator,
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
    EyeIcon,
    ArrowPathIcon,
    ArrowUpTrayIcon,
    ChartBarIcon,
    FolderIcon,
    TagIcon,
    PlusIcon,
    XMarkIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import { CalendarIcon } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ITEMS_PER_PAGE = 10;

// Document type icon mapping
const DocumentTypeIcon = ({ type, className = "h-5 w-5" }: { type: DocumentType; className?: string }) => {
    const icons = {
        [DocumentType.PDF]: <DocumentIcon className={`${className} text-blue-500`} />,
        [DocumentType.DOCX]: <DocumentTextIcon className={`${className} text-indigo-500`} />,
        [DocumentType.XLSX]: <DocumentChartBarIcon className={`${className} text-green-500`} />,
        [DocumentType.IMAGE]: <PhotoIcon className={`${className} text-purple-500`} />
    };
    return icons[type] || <DocumentIcon className={`${className} text-gray-500`} />;
};

// Status badge component
const StatusBadge = ({ status }: { status: AnalysisStatus }) => {
    const statusConfig: Record<AnalysisStatus, { className: string; label: string }> = {
        [AnalysisStatus.PENDING]: {
            className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            label: 'Ready for Analysis'
        },
        [AnalysisStatus.PROCESSING]: {
            className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            label: 'Processing'
        },
        [AnalysisStatus.COMPLETED]: {
            className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            label: 'Analysis Complete'
        },
        [AnalysisStatus.FAILED]: {
            className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            label: 'Analysis Failed'
        },
        [AnalysisStatus.WAITING_FOR_APPROVAL]: {
            className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            label: 'Waiting for Approval'
        }
    };

    const config = statusConfig[status];

    return (
        <Badge variant="secondary" className={config.className}>
            {config.label}
        </Badge>
    );
};

// Custom styles for the Calendar component
const calendarStyles = {
    day_today: "bg-muted text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground",
    day_range_start: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md",
    day_range_end: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-r-md",
    day_range_middle: "bg-primary/15 text-foreground hover:bg-primary/20 focus:bg-primary/20 rounded-none",
    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
};

export default function DocumentsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isAuthenticated } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<AnalysisStatus | 'ALL'>('ALL');
    const [typeFilter, setTypeFilter] = useState<DocumentType | 'ALL'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined;
        to: Date | undefined;
    }>({
        from: undefined,
        to: undefined
    });
    const [tagFilter, setTagFilter] = useState<number | 'ALL'>('ALL');
    const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [selectedDocumentForTags, setSelectedDocumentForTags] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set());

    const {
        documents = [],
        isLoading: isLoadingDocuments,
        error: documentError,
        fetchDocuments,
        deleteDocument,
        setFilters,
        tags = [],
        isLoadingTags,
        tagError,
        fetchTags,
        createTag,
        updateDocumentTags,
        deleteTag,
    } = useDocumentStore();

    const {
        analyses = [],
        isLoading: isLoadingAnalyses,
        fetchUserAnalyses
    } = useAnalysisStore();

    // Create a map of document IDs to their latest analysis status
    const documentAnalysisStatus = useMemo(() => {
        const statusMap = new Map<string, AnalysisStatus>();
        analyses.forEach(analysis => {
            const currentStatus = statusMap.get(analysis.document_id);
            // Only update if there's no status yet or if this analysis is more recent
            if (!currentStatus || new Date(analysis.created_at) > new Date(analysis.created_at)) {
                statusMap.set(analysis.document_id, analysis.status as AnalysisStatus);
            }
        });
        return statusMap;
    }, [analyses]);

    // Initialize page with documents and analyses
    useEffect(() => {
        if (isAuthenticated) {
            const loadData = async () => {
                try {
                    await Promise.all([
                        fetchDocuments(),
                        fetchUserAnalyses()
                    ]);
                } catch (error) {
                    handleError(error);
                }
            };
            loadData();
        }
    }, [isAuthenticated, currentPage, statusFilter, typeFilter]);

    // Add tag initialization
    useEffect(() => {
        if (isAuthenticated) {
            fetchTags();
        }
    }, [isAuthenticated]);

    // Filter documents based on search, filters, and date range
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
            const documentStatus = documentAnalysisStatus.get(doc.id) || AnalysisStatus.PENDING;
            const matchesStatus = statusFilter === 'ALL' || documentStatus === statusFilter;
            const matchesType = typeFilter === 'ALL' || doc.type === typeFilter;
            const matchesTag = tagFilter === 'ALL' || doc.tags.some(tag => tag.id === tagFilter);

            const matchesDateRange = !dateRange.from || !dateRange.to || isWithinInterval(
                new Date(doc.uploaded_at),
                { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) }
            );

            return matchesSearch && matchesStatus && matchesType && matchesTag && matchesDateRange;
        });
    }, [documents, searchQuery, statusFilter, typeFilter, tagFilter, dateRange, documentAnalysisStatus]);

    const handleError = (error: any) => {
        const message = error instanceof Error ? error.message : 'An error occurred';
        toast({
            title: "Error",
            description: message,
            variant: "destructive",
        });
    };

    const handleDelete = async (documentId: string) => {
        try {
            await deleteDocument(documentId);
            setSelectedDocuments(prev => {
                const next = new Set(prev);
                next.delete(documentId);
                return next;
            });
            toast({
                description: "Document deleted successfully",
                duration: 3000,
            });
        } catch (error) {
            handleError(error);
        }
    };

    const handleBatchDelete = async () => {
        try {
            await Promise.all(Array.from(selectedDocuments).map(id => deleteDocument(id)));
            setSelectedDocuments(new Set());
            toast({
                description: `${selectedDocuments.size} documents deleted successfully`,
                duration: 3000,
            });
        } catch (error) {
            handleError(error);
        }
    };

    const handleAnalyze = (documentId: string) => {
        router.push(`/dashboard/analysis/${documentId}`);
    };

    const handleBatchAnalyze = () => {
        const documentIds = Array.from(selectedDocuments);
        router.push(`/dashboard/analysis/batch?documents=${documentIds.join(',')}`);
    };

    const toggleDocumentSelection = (documentId: string) => {
        setSelectedDocuments(prev => {
            const next = new Set(prev);
            if (next.has(documentId)) {
                next.delete(documentId);
            } else {
                next.add(documentId);
            }
            return next;
        });
    };

    const toggleAllDocuments = () => {
        if (selectedDocuments.size === filteredDocuments.length) {
            setSelectedDocuments(new Set());
        } else {
            setSelectedDocuments(new Set(filteredDocuments.map(d => d.id)));
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;

        try {
            await createTag({ name: newTagName.trim() });
            setNewTagName('');
            toast({
                description: "Tag created successfully",
                duration: 3000,
            });
        } catch (error) {
            handleError(error);
        }
    };

    const handleUpdateDocumentTags = async (documentId: string, tagIds: number[]) => {
        try {
            await updateDocumentTags(documentId, tagIds);
            toast({
                description: "Document tags updated successfully",
                duration: 3000,
            });
        } catch (error) {
            handleError(error);
        }
    };

    const handleDeleteTag = async (tagId: number) => {
        try {
            await deleteTag(tagId);
            toast({
                description: "Tag deleted successfully",
                duration: 3000,
            });
        } catch (error) {
            handleError(error);
        }
    };

    if (isLoadingDocuments || isLoadingAnalyses) {
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

    return (
        <>
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                    <p className="text-muted-foreground">
                        Manage your documents
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/dashboard/upload')}
                    className="gap-2"
                >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    Upload
                </Button>
            </div>

            {/* Filters and Actions */}
            <Card className="p-6">
                <div className="space-y-4">
                    {/* Search and Filters */}
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
                                <SelectItem value={AnalysisStatus.PENDING}>Ready for Analysis</SelectItem>
                                <SelectItem value={AnalysisStatus.PROCESSING}>Processing</SelectItem>
                                <SelectItem value={AnalysisStatus.COMPLETED}>Completed</SelectItem>
                                <SelectItem value={AnalysisStatus.FAILED}>Failed</SelectItem>
                                <SelectItem value={AnalysisStatus.WAITING_FOR_APPROVAL}>Waiting for Approval</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={typeFilter}
                            onValueChange={(value) => setTypeFilter(value as DocumentType | 'ALL')}
                        >
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                <SelectItem value={DocumentType.PDF}>PDF</SelectItem>
                                <SelectItem value={DocumentType.DOCX}>DOCX</SelectItem>
                                <SelectItem value={DocumentType.XLSX}>XLSX</SelectItem>
                                <SelectItem value={DocumentType.IMAGE}>Image</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={tagFilter.toString()}
                            onValueChange={(value) => setTagFilter(value === 'ALL' ? 'ALL' : parseInt(value))}
                        >
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Filter by tag" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Tags</SelectItem>
                                {tags.map((tag) => (
                                    <SelectItem key={tag.id} value={tag.id.toString()}>
                                        {tag.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal md:w-[300px]",
                                        !dateRange.from && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                                {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Filter by date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <div className="p-3 border-b">
                                    <h4 className="text-sm font-medium">Select Date Range</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Choose start and end dates to filter documents
                                    </p>
                                </div>
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange.from}
                                    selected={{
                                        from: dateRange.from,
                                        to: dateRange.to,
                                    }}
                                    onSelect={(range) => {
                                        setDateRange({
                                            from: range?.from,
                                            to: range?.to
                                        });
                                    }}
                                    numberOfMonths={2}
                                    classNames={calendarStyles}
                                />
                                <div className="border-t p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-muted" />
                                            <span>Today</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span>Selected</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-primary/15" />
                                            <span>Range</span>
                                        </div>
                                    </div>
                                    {(dateRange.from || dateRange.to) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDateRange({ from: undefined, to: undefined })}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Tag Management Dialog */}
                        <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <TagIcon className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Manage Tags</DialogTitle>
                                    <DialogDescription>
                                        Create and manage tags for your documents.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="New tag name..."
                                            value={newTagName}
                                            onChange={(e) => setNewTagName(e.target.value)}
                                        />
                                        <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
                                            <PlusIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {tags.map((tag) => (
                                            <div
                                                key={tag.id}
                                                className="flex items-center justify-between p-2 bg-muted rounded-md"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{tag.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Created {formatDistanceToNow(new Date(tag.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteTag(tag.id)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Batch Actions */}
                    {selectedDocuments.size > 0 && (
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                {selectedDocuments.size} document{selectedDocuments.size > 1 ? 's' : ''} selected
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBatchAnalyze}
                                >
                                    <ChartBarIcon className="w-4 h-4 mr-2" />
                                    Analyze Selected
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBatchDelete}
                                >
                                    <TrashIcon className="w-4 h-4 mr-2" />
                                    Delete Selected
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Documents Table */}
                    {documentError ? (
                        <div className="text-center py-8">
                            <FolderIcon className="mx-auto h-12 w-12 text-destructive" />
                            <h3 className="mt-2 text-lg font-semibold">Error loading documents</h3>
                            <p className="text-muted-foreground">{documentError}</p>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-8">
                            <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-2 text-lg font-semibold">No documents found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                                    ? "No documents match your filters"
                                    : "Upload a document to get started"}
                            </p>
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[30px]">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocuments.size === filteredDocuments.length}
                                                onChange={toggleAllDocuments}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </TableHead>
                                        <TableHead>Document</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead>Tags</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDocuments.map((document) => (
                                        <TableRow key={document.id} className="group">
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDocuments.has(document.id)}
                                                    onChange={() => toggleDocumentSelection(document.id)}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <DocumentTypeIcon type={document.type} />
                                                    <div className="space-y-1">
                                                        <p className="font-medium truncate max-w-[300px]">
                                                            {document.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Uploaded {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{document.type}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={documentAnalysisStatus.get(document.id) || AnalysisStatus.PENDING} />
                                            </TableCell>
                                            <TableCell>
                                                {document.updated_at
                                                    ? formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })
                                                    : 'Never'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {document.tags.map((tag) => (
                                                        <Badge
                                                            key={tag.id}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {tag.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <ChevronDownIcon className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem
                                                            onClick={() => router.push(`/dashboard/documents/${document.id}`)}
                                                        >
                                                            <EyeIcon className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {documentAnalysisStatus.get(document.id) !== AnalysisStatus.PROCESSING && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleAnalyze(document.id)}
                                                            >
                                                                <ChartBarIcon className="mr-2 h-4 w-4" />
                                                                Analyze
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 dark:text-red-400"
                                                            onClick={() => handleDelete(document.id)}
                                                        >
                                                            <TrashIcon className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedDocumentForTags(document.id);
                                                                setSelectedTags(new Set(document.tags.map(t => t.id)));
                                                            }}
                                                        >
                                                            <TagIcon className="mr-2 h-4 w-4" />
                                                            Manage Tags
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

                    {/* Pagination */}
                    {filteredDocuments.length > 0 && (
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
                                    disabled={filteredDocuments.length < ITEMS_PER_PAGE}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Document Tags Dialog */}
                    <Dialog
                        open={!!selectedDocumentForTags}
                        onOpenChange={(open) => !open && setSelectedDocumentForTags(null)}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Manage Document Tags</DialogTitle>
                                <DialogDescription>
                                    Select or remove tags for this document
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {tags.map((tag) => (
                                        <div
                                            key={tag.id}
                                            className={cn(
                                                "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                                                selectedTags.has(tag.id)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted hover:bg-muted/80"
                                            )}
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
                                                <XMarkIcon className="h-4 w-4" />
                                            ) : (
                                                <PlusIcon className="h-4 w-4" />
                                            )}
                                        </div>
                                    ))}
                                </div>
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
                                        onClick={() => setSelectedDocumentForTags(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (selectedDocumentForTags) {
                                                handleUpdateDocumentTags(
                                                    selectedDocumentForTags,
                                                    Array.from(selectedTags)
                                                );
                                                setSelectedDocumentForTags(null);
                                            }
                                        }}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </Card>
        </>
    );
} 