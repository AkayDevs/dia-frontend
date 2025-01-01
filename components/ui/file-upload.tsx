import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Document } from '@/types/document';

interface FileUploadProps {
    onUploadSuccess?: (document: Document) => void;
    onUploadError?: (error: Error) => void;
    className?: string;
}

export function FileUpload({ onUploadSuccess, onUploadError, className = '' }: FileUploadProps) {
    const { upload, isUploading } = useFileUpload();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        try {
            const document = await upload(acceptedFiles[0], {
                onSuccess: onUploadSuccess,
                onError: onUploadError,
            });
            return document;
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }, [upload, onUploadSuccess, onUploadError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'image/*': ['.png', '.jpg', '.jpeg'],
        },
        multiple: false,
    });

    return (
        <div
            {...getRootProps()}
            className={`
        relative border-2 border-dashed rounded-lg p-8
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        hover:border-primary hover:bg-primary/5 transition-colors
        cursor-pointer flex flex-col items-center justify-center gap-4
        ${className}
      `}
        >
            <input {...getInputProps()} />

            {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                    <File className="h-10 w-10 text-muted-foreground animate-pulse" />
                    <p className="text-muted-foreground">Uploading...</p>
                </div>
            ) : (
                <>
                    <Upload className={`h-10 w-10 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-center">
                        <p className="text-muted-foreground">
                            {isDragActive ? (
                                "Drop the file here"
                            ) : (
                                <>
                                    Drag & drop a file here, or <span className="text-primary">click to select</span>
                                </>
                            )}
                        </p>
                        <p className="text-sm text-muted-foreground/75 mt-2">
                            Supports PDF, DOCX, XLSX, and images
                        </p>
                    </div>
                </>
            )}
        </div>
    );
} 