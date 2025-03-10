import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Document } from '@/types/document';
import { DocumentType, AnalysisStatus } from '@/enums/document';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';
import {
    DocumentIcon,
    DocumentTextIcon,
    DocumentChartBarIcon,
    PhotoIcon,
    TrashIcon,
    ArrowRightIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from "@/components/ui/skeleton";

export interface DocumentListProps {
    documents: Document[];
    onDelete: (id: string) => Promise<void>;
    onAnalyze?: (id: string) => Promise<void>;
    isCompact?: boolean;
    showAnalyzeButton?: boolean;
    className?: string;
}

const DocumentTypeIcon = ({ type }: { type: any }) => {
    const docType = typeof type === 'string' ? type : DocumentType.UNKNOWN;

    switch (docType) {
        case DocumentType.PDF:
            return <DocumentTextIcon className="w-5 h-5 text-primary" />;
        case DocumentType.DOCX:
            return <DocumentIcon className="w-5 h-5 text-primary" />;
        case DocumentType.XLSX:
            return <TableCellsIcon className="w-5 h-5 text-primary" />;
        case DocumentType.IMAGE:
            return <PhotoIcon className="w-5 h-5 text-primary" />;
        default:
            return <DocumentIcon className="w-5 h-5 text-primary" />;
    }
};

const StatusBadge = ({ status, errorMessage }: { status: any; errorMessage?: string }) => {
    const getStatusConfig = () => {
        // Handle string status values
        const statusValue = typeof status === 'string' ? status : String(status);

        switch (statusValue) {
            case AnalysisStatus.PENDING:
                return { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
            case AnalysisStatus.PROCESSING:
                return { className: 'bg-blue-100 text-blue-800', label: 'Processing' };
            case AnalysisStatus.COMPLETED:
                return { className: 'bg-green-100 text-green-800', label: 'Completed' };
            case AnalysisStatus.FAILED:
                return { className: 'bg-red-100 text-red-800', label: 'Failed' };
            default:
                return { className: 'bg-gray-100 text-gray-800', label: statusValue };
        }
    };

    const config = getStatusConfig();

    return (
        <Tooltip>
            <TooltipTrigger>
                <Badge variant="secondary" className={`gap-1.5 ${config.className}`}>
                    <span className="capitalize">{config.label}</span>
                </Badge>
            </TooltipTrigger>
            <TooltipContent>
                {status === AnalysisStatus.FAILED && errorMessage ? (
                    <p className="text-sm text-destructive">{errorMessage}</p>
                ) : (
                    <p className="text-sm">Document status: {config.label}</p>
                )}
            </TooltipContent>
        </Tooltip>
    );
};

export function DocumentList({
    documents,
    onDelete,
    onAnalyze,
    isCompact = false,
    showAnalyzeButton = false,
    className = '',
    isLoading = false
}: DocumentListProps & { isLoading?: boolean }) {
    const router = useRouter();

    const isProcessingOrPending = (status: any): boolean => {
        if (!status) return false;
        return status === AnalysisStatus.PROCESSING ||
            status === AnalysisStatus.PENDING ||
            status === 'processing' ||
            status === 'pending';
    };

    if (isLoading) {
        return (
            <div className={`space-y-3 ${className}`}>
                {[...Array(isCompact ? 3 : 5)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 min-w-0">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                    <DocumentIcon className="w-12 h-12 text-muted-foreground/50" />
                    <p className="text-lg text-muted-foreground">No documents found</p>
                </div>
            </Card>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {documents.map((document, index) => (
                <motion.div
                    key={document.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                    <Card className={`${isCompact ? 'p-3' : 'p-4'} hover:shadow-md transition-shadow`}>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                                    <DocumentTypeIcon type={document.type} />
                                </div>
                                <div className="min-w-0">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <h3 className="font-medium truncate max-w-[300px]">
                                                {document.name}
                                            </h3>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="space-y-1">
                                                <p className="font-medium">{document.name}</p>
                                                <p className="text-xs text-white">
                                                    Size: {(document.size / 1024).toFixed(2)} KB
                                                </p>
                                                <p className="text-xs text-white">
                                                    Uploaded: {format(new Date(document.uploaded_at), 'PPpp')}
                                                </p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                    {!isCompact && (
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-sm text-muted-foreground">
                                                {(document.size / 1024).toFixed(2)} KB
                                            </p>
                                            <span className="text-muted-foreground/30">•</span>
                                            <p className="text-sm text-muted-foreground">
                                                Uploaded {formatDistanceToNow(new Date(document.uploaded_at))} ago
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                {document.hasOwnProperty('status') && (
                                    <StatusBadge
                                        status={(document as any).status}
                                        errorMessage={(document as any).error_message}
                                    />
                                )}
                                <div className="flex items-center gap-2">
                                    {showAnalyzeButton && onAnalyze && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onAnalyze(document.id)}
                                                    disabled={isProcessingOrPending((document as any).status)}
                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <ArrowPathIcon className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {isProcessingOrPending((document as any).status)
                                                    ? 'Analysis in progress'
                                                    : 'Analyze document'
                                                }
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(document.id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Delete document</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/dashboard/documents/${document.id}`)}
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <ArrowRightIcon className="w-4 h-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>View details</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
} 