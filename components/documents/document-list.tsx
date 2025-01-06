import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Document, AnalysisStatus } from '@/services/document.service';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
    DocumentIcon,
    DocumentTextIcon,
    DocumentChartBarIcon,
    PhotoIcon,
    TrashIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface DocumentListProps {
    documents: Document[];
    onDelete: (id: string) => Promise<void>;
}

const DocumentTypeIcon = ({ type }: { type: Document['type'] }) => {
    switch (type) {
        case 'PDF':
            return <DocumentIcon className="w-5 h-5" />;
        case 'DOCX':
            return <DocumentTextIcon className="w-5 h-5" />;
        case 'XLSX':
            return <DocumentChartBarIcon className="w-5 h-5" />;
        case 'IMAGE':
            return <PhotoIcon className="w-5 h-5" />;
        default:
            return <DocumentIcon className="w-5 h-5" />;
    }
};

const StatusBadge = ({ status }: { status: AnalysisStatus }) => {
    const getStatusColor = () => {
        switch (status) {
            case AnalysisStatus.PENDING:
                return 'bg-blue-100 text-blue-700';
            case AnalysisStatus.PROCESSING:
                return 'bg-yellow-100 text-yellow-700';
            case AnalysisStatus.COMPLETED:
                return 'bg-green-100 text-green-700';
            case AnalysisStatus.FAILED:
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {status.toLowerCase()}
        </span>
    );
};

export function DocumentList({ documents, onDelete }: DocumentListProps) {
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
        <div className="space-y-3">
            {documents.map((document, index) => (
                <motion.div
                    key={document.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                    <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                                    <DocumentTypeIcon type={document.type} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-medium truncate">{document.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Uploaded {formatDistanceToNow(new Date(document.uploaded_at))} ago
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <StatusBadge status={document.status} />
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(document.id)}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => router.push(`/dashboard/documents/${document.id}`)}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
} 