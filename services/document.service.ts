import { API_URL, API_VERSION } from '@/lib/constants';
import { BaseResponse } from '@/types/base';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import {
    Document,
    DocumentWithAnalysis,
    DocumentListParams,
    DocumentListResponse,
} from '@/types/document';

class DocumentService {
    private baseUrl = `${API_URL}${API_VERSION}/documents`;

    // Helper method for common fetch options
    private getHeaders(isFormData: boolean = false): HeadersInit {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            throw new Error('Not authenticated');
        }

        const headers: HeadersInit = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        return headers;
    }

    // Helper method to handle errors
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication failed');
            }
            const error = await response.json();
            throw new Error(error.detail || error.message || 'An error occurred');
        }
        return response.json();
    }

    /**
     * Upload a single document
     */
    async uploadDocument(file: File): Promise<Document> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseUrl}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: formData,
        });

        return this.handleResponse<Document>(response);
    }

    /**
     * Upload multiple documents
     */
    async uploadDocuments(files: File[]): Promise<Document[]> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await fetch(`${this.baseUrl}/batch`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: formData,
        });

        return this.handleResponse<Document[]>(response);
    }

    /**
     * Get list of documents with optional filtering
     */
    async getDocuments(params: DocumentListParams = {}): Promise<DocumentListResponse> {
        const queryParams = new URLSearchParams();

        if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params.status) queryParams.append('status', params.status);
        if (params.doc_type) queryParams.append('doc_type', params.doc_type);

        const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<DocumentListResponse>(response);
    }

    /**
     * Get document by ID with analysis results
     */
    async getDocument(documentId: string): Promise<DocumentWithAnalysis> {
        const response = await fetch(`${this.baseUrl}/${documentId}`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<DocumentWithAnalysis>(response);
    }

    /**
     * Delete a document
     */
    async deleteDocument(documentId: string): Promise<BaseResponse> {
        const response = await fetch(`${this.baseUrl}/${documentId}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        return this.handleResponse<BaseResponse>(response);
    }
}

export const documentService = new DocumentService(); 