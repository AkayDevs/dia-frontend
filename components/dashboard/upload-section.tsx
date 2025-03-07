import { Card } from '@/components/ui/card';
import { UploadHandler } from '@/components/ui/upload-handler';
import { DocumentIcon } from '@heroicons/react/24/outline';

interface UploadSectionProps {
    onUploadSuccess: (file: File) => Promise<void>;
    onBatchUpload: (files: File[]) => Promise<void>;
    onError: (error: any) => void;
    className?: string;
}

export function UploadSection({ onUploadSuccess, onBatchUpload, onError, className = '' }: UploadSectionProps) {
    return (
        <Card className={`h-full flex flex-col ${className}`}>
            <div className="p-6 pb-4 border-b">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <DocumentIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold">Upload Files</h3>
                        <p className="text-sm text-muted-foreground">
                            Drag and drop or click to upload
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col">
                <UploadHandler
                    onSuccess={onUploadSuccess}
                    onBatchUpload={onBatchUpload}
                    onError={onError}
                    className="flex-1 h-[250px]"
                    accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                    multiple
                />
            </div>
        </Card>
    );
} 