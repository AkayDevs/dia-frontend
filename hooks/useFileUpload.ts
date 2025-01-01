import { useState } from 'react';
import { useDocumentStore, createMockDocument } from '@/store/useDocumentStore';
import { Document } from '@/types/document';

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

            // For development: Create a mock document
            const mockDocument = createMockDocument(file);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Add the document to the store
            addDocument(mockDocument);

            // Call success callback
            options?.onSuccess?.(mockDocument);

            return mockDocument;

            /* TODO: Replace with actual API implementation
            const formData = new FormData();
            formData.append('file', file);

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
            */
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error occurred');
            options?.onError?.(err);
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        upload,
        isUploading,
    };
}; 