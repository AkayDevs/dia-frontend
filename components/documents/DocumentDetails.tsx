import { Card } from '@/components/ui/card';
import { DocumentType } from '@/enums/document';
import { format } from 'date-fns';

interface DocumentDetailsProps {
    type: DocumentType;
    uploadedAt: string;
    updatedAt?: string;
    isArchived: boolean;
}

export const DocumentDetails = ({
    type,
    uploadedAt,
    updatedAt,
    isArchived
}: DocumentDetailsProps) => {
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return format(date, 'PP');
        } catch (error) {
            return 'N/A';
        }
    };

    return (
        <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Document Details</h4>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">File Type</span>
                    <span className="text-sm font-medium">{type}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Upload Date</span>
                    <span className="text-sm font-medium">{formatDate(uploadedAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-sm font-medium">
                        {isArchived ? 'Archived' : 'Active'}
                    </span>
                </div>
                {updatedAt && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Last Updated</span>
                        <span className="text-sm font-medium">{formatDate(updatedAt)}</span>
                    </div>
                )}
            </div>
        </Card>
    );
}; 