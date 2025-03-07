import { Card } from '@/components/ui/card';
import { DocumentType } from '@/enums/document';
import { formatDistanceToNow } from 'date-fns';

interface DocumentStatsCardsProps {
    size: number;
    type: DocumentType;
    pageCount?: number;
    updatedAt?: string;
}

export const DocumentStatsCards = ({
    size,
    type,
    pageCount,
    updatedAt
}: DocumentStatsCardsProps) => {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">File Size</h4>
                <p className="text-2xl font-bold">{(size / 1024 / 1024).toFixed(2)} MB</p>
            </Card>
            <Card className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Pages</h4>
                <p className="text-2xl font-bold">
                    {type === DocumentType.PDF || type === DocumentType.DOCX ?
                        pageCount || '1' :
                        '1'
                    }
                </p>
            </Card>
            <Card className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Last Modified</h4>
                <p className="text-2xl font-bold">
                    {updatedAt ?
                        formatDistanceToNow(new Date(updatedAt), { addSuffix: true }) :
                        'Recently'
                    }
                </p>
            </Card>
        </div>
    );
}; 