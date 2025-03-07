import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import {
    ArrowDownTrayIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

interface DocumentHeaderProps {
    name: string;
    uploadedAt: string;
    onEdit: () => void;
    onDelete: () => void;
    onDownload: () => void;
}

export const DocumentHeader = ({
    name,
    uploadedAt,
    onEdit,
    onDelete,
    onDownload
}: DocumentHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">{name}</h2>
                <p className="text-sm text-muted-foreground">
                    Uploaded {formatDistanceToNow(new Date(uploadedAt))} ago
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onDownload}>
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Download
                </Button>
                <Button variant="outline" size="sm" onClick={onEdit}>
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={onDelete}>
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete
                </Button>
            </div>
        </div>
    );
}; 