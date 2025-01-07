'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Document } from '@/types/document';
import { ArrowUpTrayIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { Progress } from '@/components/ui/progress';

export interface UploadHandlerProps {
    onSuccess?: (file: File) => void;
    onBatchUpload?: (files: File[]) => void;
    onError?: (error: any) => void;
    className?: string;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number;
}

interface UploadProgress {
    total: number;
    current: number;
    files: { [key: string]: number };
}

export function UploadHandler({
    onSuccess,
    onBatchUpload,
    onError,
    className = '',
    accept,
    multiple = false,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024 // 10MB default
}: UploadHandlerProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        total: 0,
        current: 0,
        files: {}
    });

    const handleUpload = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setIsUploading(true);
        setUploadProgress({
            total: acceptedFiles.length,
            current: 0,
            files: acceptedFiles.reduce((acc, file) => ({ ...acc, [file.name]: 0 }), {})
        });

        try {
            if (acceptedFiles.length === 1 && onSuccess) {
                await onSuccess(acceptedFiles[0]);
            } else if (acceptedFiles.length > 0 && onBatchUpload) {
                await onBatchUpload(acceptedFiles);
            }
        } catch (error) {
            onError?.(error);
        } finally {
            setIsUploading(false);
            setUploadProgress({ total: 0, current: 0, files: {} });
        }
    }, [onSuccess, onBatchUpload, onError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleUpload,
        accept: accept ? {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'image/*': ['.png', '.jpg', '.jpeg']
        } : undefined,
        multiple,
        maxFiles,
        maxSize,
        disabled: isUploading
    });

    const totalProgress = uploadProgress.total > 0
        ? (uploadProgress.current / uploadProgress.total) * 100
        : 0;

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
                            className="flex flex-col items-center gap-4 w-full max-w-[300px]"
                        >
                            <Progress value={totalProgress} className="w-full" />
                            <p className="text-sm text-muted-foreground">
                                Uploading {uploadProgress.current} of {uploadProgress.total} files...
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
                            {multiple ? (
                                <DocumentDuplicateIcon
                                    className={`w-10 h-10 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`}
                                />
                            ) : (
                                <ArrowUpTrayIcon
                                    className={`w-10 h-10 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`}
                                />
                            )}
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    {isDragActive ? (
                                        multiple ? "Drop your files here" : "Drop your file here"
                                    ) : (
                                        <>
                                            Drag & drop {multiple ? 'files' : 'a file'} here, or{' '}
                                            <span className="text-primary">click to select</span>
                                        </>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {multiple ? (
                                        `Upload up to ${maxFiles} files (max ${maxSize / (1024 * 1024)}MB each)`
                                    ) : (
                                        `Max file size: ${maxSize / (1024 * 1024)}MB`
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
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