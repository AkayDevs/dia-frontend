import { useState } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { Document, DocumentType } from '@/types/document';

interface UploadOptions {
    onSuccess?: (document: Document) => void;
    onError?: (error: Error) => void;
}

export const useFileUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const { addDocument } = useDocumentStore();

    const upload = async (file: File, options?: UploadOptions) => {
        try {
            setIsUploading(true);

            // Create form data
            const formData = new FormData();
            formData.append('file', file);

            // TODO: Replace with your actual API endpoint
            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const document: Document = await response.json();

            addDocument(document);
            options?.onSuccess?.(document);

            return document;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error occurred');
            options?.onError?.(err);
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    const getFileType = (file: File): DocumentType => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'pdf';
            case 'doc':
            case 'docx':
                return 'docx';
            case 'xls':
            case 'xlsx':
                return 'xlsx';
            case 'png':
            case 'jpg':
            case 'jpeg':
                return 'image';
            default:
                throw new Error('Unsupported file type');
        }
    };

    return {
        upload,
        isUploading,
        getFileType,
    };
}; 