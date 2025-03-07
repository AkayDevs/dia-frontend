import { formatDistanceToNow } from 'date-fns';
import { Document } from '@/types/document';
import { AnalysisStatus } from '@/enums/analysis';
import { DocumentTypeIcon } from './DocumentTypeIcon';
import { StatusBadge } from './StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnalysisRunWithResults } from '@/types/analysis/base';
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
import {
    ChevronDownIcon,
    EyeIcon,
    ChartBarIcon,
    TrashIcon,
    TagIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface DocumentsTableProps {
    documents: Document[];
    selectedDocuments: Set<string>;
    documentAnalysisStatus: Map<string, AnalysisStatus>;
    documentAnalyses: Map<string, AnalysisRunWithResults[]>;
    onToggleDocument: (documentId: string) => void;
    onToggleAll: () => void;
    onViewDetails: (documentId: string) => void;
    onAnalyze: (documentId: string) => void;
    onDelete: (documentId: string) => void;
    onManageDocumentTags: (documentId: string) => void;
}

export const DocumentsTable = ({
    documents,
    selectedDocuments,
    documentAnalysisStatus,
    documentAnalyses,
    onToggleDocument,
    onToggleAll,
    onViewDetails,
    onAnalyze,
    onDelete,
    onManageDocumentTags,
}: DocumentsTableProps) => {
    const allSelected = documents.length > 0 && selectedDocuments.size === documents.length;
    const someSelected = selectedDocuments.size > 0 && selectedDocuments.size < documents.length;

    return (
        <div className="relative overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[40px]">
                            <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected ? true : undefined}
                                onCheckedChange={onToggleAll}
                                aria-label="Select all documents"
                            />
                        </TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead className="hidden md:table-cell">Type</TableHead>
                        <TableHead>Analysis Status</TableHead>
                        <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                        <TableHead className="hidden lg:table-cell">Tags</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((document) => (
                        <TableRow
                            key={document.id}
                            className={cn(
                                "group hover:bg-muted/50 transition-colors",
                                selectedDocuments.has(document.id) && "bg-primary/5"
                            )}
                        >
                            <TableCell>
                                <Checkbox
                                    checked={selectedDocuments.has(document.id)}
                                    onCheckedChange={() => onToggleDocument(document.id)}
                                    aria-label={`Select ${document.name}`}
                                />
                            </TableCell>
                            <TableCell>
                                <div
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => onViewDetails(document.id)}
                                >
                                    <div className="p-2 bg-muted rounded-md flex-shrink-0">
                                        <DocumentTypeIcon type={document.type} />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium truncate max-w-[200px] md:max-w-[300px]">
                                                {document.name}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewDetails(document.id);
                                                }}
                                            >
                                                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Uploaded {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge variant="outline" className="capitalize">
                                    {document.type}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <StatusBadge
                                    status={documentAnalysisStatus.get(document.id) || AnalysisStatus.PENDING}
                                    analyses={documentAnalyses.get(document.id) || []}
                                />
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                {document.updated_at
                                    ? formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })
                                    : 'Never'}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {document.tags.length > 0 ? (
                                        document.tags.slice(0, 2).map((tag) => (
                                            <Badge
                                                key={tag.id}
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {tag.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No tags</span>
                                    )}

                                    {document.tags.length > 2 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{document.tags.length - 2}
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <ChevronDownIcon className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem
                                            onClick={() => onViewDetails(document.id)}
                                            className="cursor-pointer"
                                        >
                                            <EyeIcon className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                        {documentAnalysisStatus.get(document.id) !== AnalysisStatus.IN_PROGRESS && (
                                            <DropdownMenuItem
                                                onClick={() => onAnalyze(document.id)}
                                                className="cursor-pointer"
                                            >
                                                <ChartBarIcon className="mr-2 h-4 w-4" />
                                                Analyze
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            onClick={() => onManageDocumentTags(document.id)}
                                            className="cursor-pointer"
                                        >
                                            <TagIcon className="mr-2 h-4 w-4" />
                                            Manage Tags
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600 dark:text-red-400 cursor-pointer"
                                            onClick={() => onDelete(document.id)}
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
    );
}; 