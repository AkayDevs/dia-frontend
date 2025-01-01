'use client';

import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types/document';

interface UploadHandlerProps {
    onSuccess?: (document: Document) => void;
    onError?: (error: Error) => void;
    redirectToAnalysis?: boolean;
    refreshDocuments?: () => Promise<void>;
    className?: string;
}

export function UploadHandler({
    onSuccess,
    onError,
    redirectToAnalysis = true,
    refreshDocuments,
    className
}: UploadHandlerProps) {
    const router = useRouter();
    const { toast } = useToast();

    const handleSuccess = async (document: Document) => {
        toast({
            description: "Document uploaded successfully!" + (redirectToAnalysis ? " Starting analysis..." : ""),
            duration: 3000,
        });

        if (refreshDocuments) {
            await refreshDocuments();
        }

        if (onSuccess) {
            onSuccess(document);
        }

        if (redirectToAnalysis) {
            router.push(`/dashboard/analysis/${document.id}`);
        }
    };

    const handleError = (error: Error) => {
        toast({
            title: "Upload Failed",
            description: error.message,
            variant: "destructive",
            duration: 5000,
        });

        if (onError) {
            onError(error);
        }
    };

    return (
        <FileUpload
            onUploadSuccess={handleSuccess}
            onUploadError={handleError}
            className={className}
        />
    );
} 