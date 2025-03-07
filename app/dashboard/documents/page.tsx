'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentType } from '@/enums/document';
import { AnalysisStatus } from '@/enums/analysis';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DocumentTypeIcon,
    StatusBadge,
    DocumentsTable,
    DocumentFilters,
    BatchActions,
    TagManagement,
    DocumentTagsDialog,
    DocumentStats,
    EmptyState,
    DocumentsHeader,
    Pagination
} from '@/components/documents';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
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
import { ChevronDownIcon, DocumentIcon, DocumentTextIcon, DocumentChartBarIcon, PhotoIcon, TrashIcon, EyeIcon, ArrowPathIcon, ChartBarIcon, TagIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

export default function DocumentsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isAuthenticated } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<AnalysisStatus | 'ALL'>('ALL');
    const [typeFilter, setTypeFilter] = useState<DocumentType | 'ALL'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
    const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
    const [dateRange, setDateRange] = useState<DateRange>({
        from: undefined,
        to: undefined
    });
    const [tagFilter, setTagFilter] = useState<number | 'ALL'>('ALL');
    const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
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
                if (analysis.status) {
                    statusMap.set(analysis.document_id, analysis.status);
                }
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
            const matchesType = typeFilter === 'ALL' || doc.type.toString() === typeFilter.toString();
            const matchesTag = tagFilter === 'ALL' || doc.tags.some(tag => tag.id === tagFilter);

            const matchesDateRange = !dateRange.from || !dateRange.to || isWithinInterval(
                new Date(doc.uploaded_at),
                { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) }
            );

            return matchesSearch && matchesStatus && matchesType && matchesTag && matchesDateRange;
        });
    }, [documents, searchQuery, statusFilter, typeFilter, tagFilter, dateRange, documentAnalysisStatus]);

    // Get paginated documents
    const paginatedDocuments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredDocuments, currentPage, itemsPerPage]);

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
        if (selectedDocuments.size === paginatedDocuments.length) {
            setSelectedDocuments(new Set());
        } else {
            setSelectedDocuments(new Set(paginatedDocuments.map(d => d.id)));
        }
    };

    const handleCreateTag = async (name: string) => {
        try {
            await createTag({ name });
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedDocuments(new Set());
    };

    const handleItemsPerPageChange = (count: number) => {
        setItemsPerPage(count);
        setCurrentPage(1);
        setSelectedDocuments(new Set());
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

    const isFiltered = searchQuery !== '' || statusFilter !== 'ALL' || typeFilter !== 'ALL' || tagFilter !== 'ALL' || dateRange.from !== undefined;
    const filterDescription = isFiltered ?
        `No documents match your current filters. Try adjusting your search or filters.` :
        undefined;

    return (
        <div className="space-y-6">
            {/* Header */}
            <DocumentsHeader
                totalDocuments={documents.length}
                onManageTags={() => setIsTagDialogOpen(true)}
            />

            {/* Stats Cards */}
            <DocumentStats
                documents={documents}
                documentAnalysisStatus={documentAnalysisStatus}
            />

            {/* Main Content */}
            <Card className="overflow-hidden border-none shadow-sm">
                <div className="p-6 border-b bg-card">
                    <DocumentFilters
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        tagFilter={tagFilter}
                        setTagFilter={setTagFilter}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        tags={tags}
                        onManageTags={() => setIsTagDialogOpen(true)}
                    />
                </div>

                <div className="p-6">
                    {/* Batch Actions */}
                    {selectedDocuments.size > 0 && (
                        <div className="mb-4">
                            <BatchActions
                                selectedCount={selectedDocuments.size}
                                onAnalyze={handleBatchAnalyze}
                                onDelete={handleBatchDelete}
                            />
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
                        <EmptyState
                            isFiltered={isFiltered}
                            filterDescription={filterDescription}
                        />
                    ) : (
                        <>
                            <DocumentsTable
                                documents={paginatedDocuments}
                                selectedDocuments={selectedDocuments}
                                documentAnalysisStatus={documentAnalysisStatus}
                                onToggleDocument={toggleDocumentSelection}
                                onToggleAll={toggleAllDocuments}
                                onViewDetails={(id: string) => router.push(`/dashboard/documents/${id}`)}
                                onAnalyze={handleAnalyze}
                                onDelete={handleDelete}
                                onManageDocumentTags={(id: string) => {
                                    setSelectedDocumentForTags(id);
                                    const doc = documents.find(d => d.id === id);
                                    if (doc) {
                                        setSelectedTags(new Set(doc.tags.map(t => t.id)));
                                    }
                                }}
                            />

                            {/* Pagination */}
                            <div className="mt-6 border-t pt-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={filteredDocuments.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={handlePageChange}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Tag Management Dialog */}
            <TagManagement
                isOpen={isTagDialogOpen}
                onClose={() => setIsTagDialogOpen(false)}
                tags={tags}
                onCreateTag={handleCreateTag}
                onDeleteTag={handleDeleteTag}
            />

            {/* Document Tags Dialog */}
            <DocumentTagsDialog
                isOpen={!!selectedDocumentForTags}
                onClose={() => setSelectedDocumentForTags(null)}
                tags={tags}
                selectedTags={selectedTags}
                onTagsChange={async (tagIds: number[]) => {
                    if (selectedDocumentForTags) {
                        await handleUpdateDocumentTags(selectedDocumentForTags, tagIds);
                        setSelectedDocumentForTags(null);
                    }
                }}
            />
        </div>
    );
} 