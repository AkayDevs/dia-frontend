import { useState } from 'react';
import { Document } from '@/types/document';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

interface UploadOptions {
    onProgress?: (progress: number) => void;
    onSuccess?: (document: Document) => void;
    onError?: (error: Error) => void;
}

export function useFileUpload() {
    const [isUploading, setIsUploading] = useState(false);

    const upload = async (file: File, options?: UploadOptions): Promise<Document | undefined> => {
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/documents/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Upload failed');
            }

            const document = await response.json();
            console.log(document);
            options?.onSuccess?.(document);
            return document;
        } catch (error) {
            const uploadError = error instanceof Error ? error : new Error('Upload failed');
            options?.onError?.(uploadError);
            throw uploadError;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        upload,
        isUploading
    };
} 