'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, documentService } from '@/services/document.service';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export interface UploadHandlerProps {
    onSuccess?: (document: Document) => void;
    onError?: (error: Error) => void;
    className?: string;
}

export function UploadHandler({ onSuccess, onError, className = '' }: UploadHandlerProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const document = await documentService.uploadDocument(file);
            onSuccess?.(document);
            setUploadProgress(100);
        } catch (error) {
            onError?.(error instanceof Error ? error : new Error('Upload failed'));
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [onSuccess, onError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        multiple: false,
        disabled: isUploading
    });

    return (
        <div
            {...getRootProps()}
            className={`
                relative border-2 border-dashed rounded-lg
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${isUploading ? 'pointer-events-none' : 'hover:border-primary hover:bg-primary/5'}
                transition-colors cursor-pointer
                ${className}
            `}
        >
            <input {...getInputProps()} />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {isUploading ? (
                        <motion.div
                            key="uploading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-full max-w-[120px] h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Uploading... {uploadProgress}%
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <ArrowUpTrayIcon
                                className={`w-10 h-10 ${isDragActive ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                            />
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    {isDragActive ? (
                                        "Drop the file here"
                                    ) : (
                                        <>
                                            Drag & drop a file here, or{' '}
                                            <span className="text-primary">click to select</span>
                                        </>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Supports PDF, DOCX, XLSX, and images
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
} 