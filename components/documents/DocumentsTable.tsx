import { formatDistanceToNow } from 'date-fns';
import { Document } from '@/types/document';
import { AnalysisStatus } from '@/enums/analysis';
import { DocumentTypeIcon } from './DocumentTypeIcon';
import { StatusBadge } from './StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from '@heroicons/react/24/outline';

interface DocumentsTableProps {
    documents: Document[];
    selectedDocuments: Set<string>;
    documentAnalysisStatus: Map<string, AnalysisStatus>;
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
    onToggleDocument,
    onToggleAll,
    onViewDetails,
    onAnalyze,
    onDelete,
    onManageDocumentTags,
}: DocumentsTableProps) => {
    return (
        <div className="relative overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30px]">
                            <input
                                type="checkbox"
                                checked={selectedDocuments.size === documents.length}
                                onChange={onToggleAll}
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
                    {documents.map((document) => (
                        <TableRow key={document.id} className="group">
                            <TableCell>
                                <input
                                    type="checkbox"
                                    checked={selectedDocuments.has(document.id)}
                                    onChange={() => onToggleDocument(document.id)}
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
                                            onClick={() => onViewDetails(document.id)}
                                        >
                                            <EyeIcon className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                        {documentAnalysisStatus.get(document.id) !== AnalysisStatus.IN_PROGRESS && (
                                            <DropdownMenuItem
                                                onClick={() => onAnalyze(document.id)}
                                            >
                                                <ChartBarIcon className="mr-2 h-4 w-4" />
                                                Analyze
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            onClick={() => onManageDocumentTags(document.id)}
                                        >
                                            <TagIcon className="mr-2 h-4 w-4" />
                                            Manage Tags
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600 dark:text-red-400"
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