import { useState } from 'react';
import { Document } from '@/types/document';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

interface UploadOptions {
    onSuccess?: (document: Document) => void;
    onError?: (error: Error) => void;
    onProgress?: (progress: number) => void;
}

export function useFileUpload() {
    const [isUploading, setIsUploading] = useState(false);

    const upload = async (file: File, options?: UploadOptions): Promise<Document | undefined> => {
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const xhr = new XMLHttpRequest();
            const token = localStorage.getItem('token');

            return new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable && options?.onProgress) {
                        const progress = Math.round((event.loaded * 100) / event.total);
                        options.onProgress(progress);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const document = JSON.parse(xhr.response);
                        options?.onSuccess?.(document);
                        resolve(document);
                    } else {
                        const error = new Error(xhr.statusText || 'Upload failed');
                        options?.onError?.(error);
                        reject(error);
                    }
                });

                xhr.addEventListener('error', () => {
                    const error = new Error('Network error occurred');
                    options?.onError?.(error);
                    reject(error);
                });

                xhr.addEventListener('loadend', () => {
                    setIsUploading(false);
                });

                xhr.open('POST', `${API_URL}${API_VERSION}/documents/upload`);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.send(formData);
            });
        } catch (error) {
            setIsUploading(false);
            const uploadError = error instanceof Error ? error : new Error('Upload failed');
            options?.onError?.(uploadError);
            throw uploadError;
        }
    };

    return {
        upload,
        isUploading
    };
} 