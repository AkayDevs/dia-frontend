import { API_URL, API_VERSION } from '@/lib/constants';

export enum DocumentType {
    PDF = 'PDF',
    DOCX = 'DOCX',
    XLSX = 'XLSX',
    IMAGE = 'IMAGE'
}

export enum AnalysisStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export interface UserStats {
    total_documents: number;
    documents_analyzed: number;
}

export interface Document {
    id: string;
    name: string;
    type: DocumentType;
    size: number;
    url: string;
    status: AnalysisStatus;
    uploaded_at: string;
    user_id: string;
}

export interface AnalysisParameters {
    type: string;
    parameters: Record<string, any>;
}

export interface AnalysisResult {
    id: string;
    document_id: string;
    type: string;
    result: Record<string, any>;
    created_at: string;
}

export interface GetDocumentsParams {
    skip?: number;
    limit?: number;
    status?: AnalysisStatus;
}

class DocumentService {
    private getHeaders(token?: string): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    async getDocuments(params: GetDocumentsParams = {}): Promise<Document[]> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const queryParams = new URLSearchParams();
        if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params.status) queryParams.append('status', params.status);

        const response = await fetch(
            `${API_URL}${API_VERSION}/documents?${queryParams.toString()}`,
            {
                headers: this.getHeaders(token),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch documents');
        }

        return response.json();
    }

    async uploadDocument(file: File): Promise<Document> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}${API_VERSION}/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload document');
        }

        return response.json();
    }

    async deleteDocument(documentId: string): Promise<void> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(
            `${API_URL}${API_VERSION}/documents/${documentId}`,
            {
                method: 'DELETE',
                headers: this.getHeaders(token),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to delete document');
        }
    }

    async analyzeDocument(documentId: string, params: AnalysisParameters): Promise<{ message: string; analysis_id: string }> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(
            `${API_URL}${API_VERSION}/documents/${documentId}/analyze`,
            {
                method: 'POST',
                headers: this.getHeaders(token),
                body: JSON.stringify(params),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to start analysis');
        }

        return response.json();
    }

    async getAnalysisResult(documentId: string, analysisId: string): Promise<AnalysisResult> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(
            `${API_URL}${API_VERSION}/documents/${documentId}/analysis/${analysisId}`,
            {
                headers: this.getHeaders(token),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch analysis result');
        }

        return response.json();
    }

    async getUserStats(): Promise<UserStats> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(
            `${API_URL}${API_VERSION}/users/me/stats`,
            {
                headers: this.getHeaders(token),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch user stats');
        }

        return response.json();
    }
}

export const documentService = new DocumentService(); 