import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ClockIcon } from '@heroicons/react/24/outline';
import { Document } from '@/types/document';
import { formatDistanceToNow } from 'date-fns';

interface DocumentVersionHistoryProps {
    versions: Document[];
    onViewVersion: (versionId: string) => void;
}

export const DocumentVersionHistory = ({
    versions,
    onViewVersion
}: DocumentVersionHistoryProps) => {
    if (versions.length === 0) return null;

    return (
        <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Version History</h4>
            <div className="space-y-3">
                {versions.map((version) => (
                    <div
                        key={version.id}
                        className="flex items-center justify-between text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDistanceToNow(new Date(version.uploaded_at), { addSuffix: true })}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewVersion(version.id)}
                        >
                            View
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );
}; 