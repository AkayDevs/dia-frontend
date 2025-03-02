import { API_URL, API_VERSION } from '@/lib/constants';
import { BaseResponse } from '@/types/base';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import {
    Document,
    DocumentWithAnalysis,
    DocumentListParams,
    Tag,
    TagCreate,
    DocumentUpdate,
    DocumentPages,
    DocumentType
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
            if (response.status === 429) {
                throw new Error('Too many requests. Please try again later.');
            }
            const error = await response.json();
            throw new Error(error.detail || error.message || 'An error occurred');
        }
        return response.json();
    }

    /**
     * Get list of documents with optional filtering
     */
    async getDocuments(params: DocumentListParams = {}): Promise<Document[]> {
        const queryParams = new URLSearchParams();

        if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params.doc_type) queryParams.append('doc_type', params.doc_type);
        if (params.tag_id !== undefined) queryParams.append('tag_id', params.tag_id.toString());

        const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse<Document[]>(response);
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
     * Upload a single document with optional tags
     */
    async uploadDocument(file: File, tagIds?: number[]): Promise<Document> {
        const formData = new FormData();
        formData.append('file', file);
        if (tagIds?.length) {
            formData.append('tag_ids', tagIds.join(','));
        }

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: formData,
        });

        return this.handleResponse<Document>(response);
    }

    /**
     * Upload multiple documents in batch
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
     * Update document metadata and/or content
     */
    async updateDocument(documentId: string, updates: DocumentUpdate): Promise<Document> {
        const formData = new FormData();

        if (updates.name) {
            formData.append('name', updates.name);
        }
        if (updates.tag_ids?.length) {
            formData.append('tag_ids', updates.tag_ids.join(','));
        }

        const response = await fetch(`${this.baseUrl}/${documentId}`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: formData,
        });

        return this.handleResponse<Document>(response);
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

    /**
     * Get document versions
     */
    async getDocumentVersions(documentId: string): Promise<Document[]> {
        const response = await fetch(`${this.baseUrl}/${documentId}/versions`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<Document[]>(response);
    }

    /**
     * Get document pages
     */
    async getDocumentPages(documentId: string): Promise<DocumentPages> {
        const response = await fetch(`${this.baseUrl}/${documentId}/pages`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<DocumentPages>(response);
    }

    /**
     * Get list of tags with optional filtering
     */
    async getTags(documentId?: string, nameFilter?: string): Promise<Tag[]> {
        const queryParams = new URLSearchParams();

        if (documentId) queryParams.append('document_id', documentId);
        if (nameFilter) queryParams.append('name_filter', nameFilter);

        const response = await fetch(`${this.baseUrl}/tag-list?${queryParams.toString()}`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<Tag[]>(response);
    }

    /**
     * Create a new tag
     */
    async createTag(tag: TagCreate): Promise<Tag> {
        const response = await fetch(`${this.baseUrl}/tag-list`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(tag),
        });

        return this.handleResponse<Tag>(response);
    }

    /**
     * Update document tags
     */
    async updateDocumentTags(documentId: string, tagIds: number[]): Promise<Document> {
        const response = await fetch(`${this.baseUrl}/${documentId}/tags`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(tagIds)
        });

        return this.handleResponse<Document>(response);
    }

    /**
     * Delete a tag
     */
    async deleteTag(tagId: number): Promise<BaseResponse> {
        const response = await fetch(`${this.baseUrl}/tag-list/${tagId}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        return this.handleResponse<BaseResponse>(response);
    }

    /**
     * Update a tag
     */
    async updateTag(tagId: number, tag: TagCreate): Promise<Tag> {
        const response = await fetch(`${this.baseUrl}/tag-list/${tagId}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(tag),
        });

        return this.handleResponse<Tag>(response);
    }
}

export const documentService = new DocumentService(); 