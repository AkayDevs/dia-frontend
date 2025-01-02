'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, AlertCircle, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Document } from '@/types/document';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
    onUploadSuccess?: (document: Document) => void;
    onUploadError?: (error: Error) => void;
    className?: string;
    maxSize?: number;
    allowedFileTypes?: Record<string, string[]>;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES: Record<string, string[]> = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'image/*': ['.png', '.jpg', '.jpeg']
};

export function FileUpload({
    onUploadSuccess,
    onUploadError,
    className = '',
    maxSize = DEFAULT_MAX_SIZE,
    allowedFileTypes = DEFAULT_ALLOWED_TYPES
}: FileUploadProps) {
    const { upload, isUploading } = useFileUpload();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateFile = (file: File): string | null => {
        if (file.size > maxSize) {
            return `File size exceeds ${maxSize / (1024 * 1024)}MB limit`;
        }

        const fileType = file.type;
        const isValidType = Object.keys(allowedFileTypes).some(type => {
            if (type.endsWith('/*')) {
                const baseType = type.split('/')[0];
                return fileType.startsWith(`${baseType}/`);
            }
            return type === fileType;
        });

        if (!isValidType) {
            return 'Invalid file type. Please upload a PDF, DOCX, XLSX, or image file.';
        }

        return null;
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const error = validateFile(file);

        if (error) {
            setValidationError(error);
            onUploadError?.(new Error(error));
            return;
        }

        setValidationError(null);

        try {
            const document = await upload(file, {
                onProgress: (progress) => {
                    setUploadProgress(progress);
                },
                onSuccess: onUploadSuccess,
                onError: (error) => {
                    setValidationError(error.message);
                    onUploadError?.(error);
                }
            });
            return document;
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }, [upload, onUploadSuccess, onUploadError, maxSize]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: allowedFileTypes,
        multiple: false,
        disabled: isUploading
    });

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {validationError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{validationError}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                {...getRootProps()}
                className={`
                    relative border-2 border-dashed rounded-lg p-8
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                    ${isUploading ? 'pointer-events-none' : 'hover:border-primary hover:bg-primary/5'}
                    transition-colors cursor-pointer flex flex-col items-center justify-center gap-4
                    ${className}
                `}
            >
                <input {...getInputProps()} />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
                        <File className="h-10 w-10 text-muted-foreground animate-pulse" />
                        <Progress value={uploadProgress} className="w-full" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading... {uploadProgress}%
                        </div>
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
                                Supports PDF, DOCX, XLSX, and images (max {maxSize / (1024 * 1024)}MB)
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
} 