import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Document, DocumentType, AnalysisStatus } from '@/types/document';
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
    ClockIcon
} from '@heroicons/react/24/outline';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export interface DocumentListProps {
    documents: Document[];
    onDelete: (id: string) => Promise<void>;
    onAnalyze?: (id: string) => Promise<void>;
    isCompact?: boolean;
    showAnalyzeButton?: boolean;
    className?: string;
}

const DocumentTypeIcon = ({ type }: { type: DocumentType }) => {
    switch (type) {
        case DocumentType.PDF:
            return <DocumentIcon className="w-5 h-5" />;
        case DocumentType.DOCX:
            return <DocumentTextIcon className="w-5 h-5" />;
        case DocumentType.XLSX:
            return <DocumentChartBarIcon className="w-5 h-5" />;
        case DocumentType.IMAGE:
            return <PhotoIcon className="w-5 h-5" />;
        default:
            return <DocumentIcon className="w-5 h-5" />;
    }
};

const StatusBadge = ({ status, errorMessage }: { status: AnalysisStatus; errorMessage?: string }) => {
    const getStatusConfig = () => {
        switch (status) {
            case AnalysisStatus.PENDING:
                return {
                    icon: <ClockIcon className="w-4 h-4" />,
                    label: 'Pending',
                    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                };
            case AnalysisStatus.PROCESSING:
                return {
                    icon: <ArrowPathIcon className="w-4 h-4 animate-spin" />,
                    label: 'Processing',
                    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                };
            case AnalysisStatus.COMPLETED:
                return {
                    icon: <CheckCircleIcon className="w-4 h-4" />,
                    label: 'Completed',
                    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                };
            case AnalysisStatus.FAILED:
                return {
                    icon: <ExclamationCircleIcon className="w-4 h-4" />,
                    label: 'Failed',
                    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                };
            default:
                return {
                    icon: <ClockIcon className="w-4 h-4" />,
                    label: status,
                    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <Tooltip>
            <TooltipTrigger>
                <Badge variant="secondary" className={`gap-1.5 ${config.className}`}>
                    {config.icon}
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
    className = ''
}: DocumentListProps) {
    const router = useRouter();

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
                                                <p className="text-xs text-muted-foreground">
                                                    Size: {(document.size / 1024).toFixed(2)} KB
                                                </p>
                                                <p className="text-xs text-muted-foreground">
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
                                <StatusBadge status={document.status} errorMessage={document.error_message} />
                                <div className="flex items-center gap-2">
                                    {showAnalyzeButton && onAnalyze && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onAnalyze(document.id)}
                                                    disabled={['processing', 'pending'].includes(document.status)}
                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <ArrowPathIcon className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {['processing', 'pending'].includes(document.status)
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