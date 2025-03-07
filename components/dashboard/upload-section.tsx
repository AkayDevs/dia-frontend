import { Card } from '@/components/ui/card';
import { UploadHandler } from '@/components/ui/upload-handler';
import { DocumentIcon } from '@heroicons/react/24/outline';

interface UploadSectionProps {
    onUploadSuccess: (file: File) => Promise<void>;
    onBatchUpload: (files: File[]) => Promise<void>;
    onError: (error: any) => void;
}

export function UploadSection({ onUploadSuccess, onBatchUpload, onError }: UploadSectionProps) {
    return (
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                    <DocumentIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold">Upload Documents</h3>
                    <p className="text-sm text-muted-foreground">
                        Drag and drop or click to upload
                    </p>
                </div>
            </div>
            <UploadHandler
                onSuccess={onUploadSuccess}
                onBatchUpload={onBatchUpload}
                onError={onError}
                className="h-[200px]"
                accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                multiple
            />
        </Card>
    );
} 