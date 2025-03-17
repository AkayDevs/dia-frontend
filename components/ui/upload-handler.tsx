'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpTrayIcon, DocumentDuplicateIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface UploadHandlerProps {
    onSuccess?: (file: File) => Promise<void>;
    onBatchUpload?: (files: File[]) => Promise<void>;
    onError?: (error: unknown) => void;
    className?: string;
    accept?: string | Record<string, string[]>;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number;
    showProgress?: boolean;
}

interface FileProgress {
    name: string;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

const DEFAULT_ACCEPT = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png']
};

const DEFAULT_MAX_SIZE = 20 * 1024 * 1024; // 20MB
const DEFAULT_MAX_FILES = 10;

export function UploadHandler({
    onSuccess,
    onBatchUpload,
    onError,
    className = '',
    accept = DEFAULT_ACCEPT,
    multiple = false,
    maxFiles = DEFAULT_MAX_FILES,
    maxSize = DEFAULT_MAX_SIZE,
    showProgress = true
}: UploadHandlerProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);

    const updateFileProgress = useCallback((fileName: string, updates: Partial<FileProgress>) => {
        setFileProgress(prev => prev.map(file =>
            file.name === fileName ? { ...file, ...updates } : file
        ));
    }, []);

    const handleUpload = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setIsUploading(true);
        setFileProgress(acceptedFiles.map(file => ({
            name: file.name,
            progress: 0,
            status: 'pending'
        })));

        try {
            if (acceptedFiles.length === 1 && onSuccess) {
                updateFileProgress(acceptedFiles[0].name, { status: 'uploading' });
                await onSuccess(acceptedFiles[0]);
                updateFileProgress(acceptedFiles[0].name, { progress: 100, status: 'success' });
            } else if (acceptedFiles.length > 0 && onBatchUpload) {
                for (const file of acceptedFiles) {
                    updateFileProgress(file.name, { status: 'uploading' });
                }
                await onBatchUpload(acceptedFiles);
                for (const file of acceptedFiles) {
                    updateFileProgress(file.name, { progress: 100, status: 'success' });
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            for (const file of acceptedFiles) {
                updateFileProgress(file.name, { status: 'error', error: errorMessage });
            }
            onError?.(error);
        } finally {
            setTimeout(() => {
                setIsUploading(false);
                setFileProgress([]);
            }, 2000); // Clear progress after 2 seconds
        }
    }, [onSuccess, onBatchUpload, onError, updateFileProgress]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleUpload,
        accept: typeof accept === 'string' ? undefined : accept,
        multiple,
        maxFiles,
        maxSize,
        disabled: isUploading
    });

    const renderUploadStatus = () => {
        if (!showProgress || fileProgress.length === 0) return null;

        return (
            <div className="space-y-2 w-full max-w-[300px]">
                {fileProgress.map(file => (
                    <div key={file.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="truncate max-w-[200px]">{file.name}</span>
                            {file.status === 'error' && (
                                <XCircleIcon className="w-4 h-4 text-destructive" />
                            )}
                        </div>
                        <Progress
                            value={file.progress}
                            className={cn(
                                "w-full",
                                file.status === 'error' && "bg-destructive/20"
                            )}
                        />
                        {file.error && (
                            <p className="text-xs text-destructive">{file.error}</p>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative min-h-[200px] border-2 border-dashed rounded-xl p-4",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                isUploading ? "pointer-events-none" : "hover:border-primary hover:bg-primary/5",
                "transition-all duration-200 ease-in-out",
                className
            )}
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
                            className="flex flex-col items-center gap-4 w-full"
                        >
                            {renderUploadStatus()}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center gap-6"
                        >
                            {multiple ? (
                                <DocumentDuplicateIcon
                                    className={cn(
                                        "w-12 h-12",
                                        isDragActive ? "text-primary" : "text-muted-foreground/60"
                                    )}
                                />
                            ) : (
                                <ArrowUpTrayIcon
                                    className={cn(
                                        "w-12 h-12",
                                        isDragActive ? "text-primary" : "text-muted-foreground/60"
                                    )}
                                />
                            )}
                            <div className="text-center space-y-2">
                                <p className="text-base font-medium text-foreground">
                                    {isDragActive ? (
                                        multiple ? "Drop your files here" : "Drop your file here"
                                    ) : (
                                        <>
                                            Drag & drop {multiple ? 'files' : 'a file'} here, or{' '}
                                            <span className="text-primary hover:underline cursor-pointer">browse</span>
                                        </>
                                    )}
                                </p>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        {multiple ? (
                                            `Upload up to ${maxFiles} files (max ${maxSize / (1024 * 1024)}MB each)`
                                        ) : (
                                            `Max file size: ${maxSize / (1024 * 1024)}MB`
                                        )}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Supports PDF, DOCX, XLSX, and images
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
} 