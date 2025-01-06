import { API_URL, API_VERSION } from '@/lib/constants';
import { Document } from '@/services/document.service';

export enum AnalysisType {
    TABLE_DETECTION = 'table_detection',
    TEXT_EXTRACTION = 'text_extraction',
    TEXT_SUMMARIZATION = 'text_summarization',
    TEMPLATE_CONVERSION = 'template_conversion',
    DOCUMENT_CLASSIFICATION = 'document_classification',
    ENTITY_EXTRACTION = 'entity_extraction',
    DOCUMENT_COMPARISON = 'document_comparison'
}

export enum AnalysisStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export interface AnalysisParameter {
    type: string;
    default: any;
    min?: number;
    max?: number;
    description: string;
    options?: string[];
}

export interface AnalysisTypeInfo {
    type: AnalysisType;
    name: string;
    description: string;
    supported_formats: string[];
    parameters: Record<string, AnalysisParameter>;
}

export interface AnalysisResult {
    id: string;
    document_id: string;
    analysis_type: AnalysisType;
    status: AnalysisStatus;
    parameters: Record<string, any>;
    result?: Record<string, any>;
    error?: string;
    created_at: string;
    completed_at?: string;
}

export interface AnalysisHistoryItem {
    id: string;
    document: Document;
    type: AnalysisType;
    status: AnalysisStatus;
    created_at: string;
    results?: Record<string, any>;
}

class AnalysisService {
    private getHeaders(token?: string): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    async getAnalysisTypes(): Promise<AnalysisTypeInfo[]> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(
            `${API_URL}${API_VERSION}/analysis/types`,
            {
                headers: this.getHeaders(token),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch analysis types');
        }

        return response.json();
    }

    async getAnalysisHistory(): Promise<AnalysisHistoryItem[]> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(
            `${API_URL}${API_VERSION}/analysis/history`,
            {
                headers: this.getHeaders(token),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch analysis history');
        }

        const results = await response.json();
        return results.map((result: any) => ({
            id: result.id,
            document: result.document,
            type: result.analysis_type,
            status: result.status,
            created_at: result.created_at,
            results: result.result
        }));
    }

    async startAnalysis(
        documentId: string,
        analysisType: AnalysisType,
        parameters: Record<string, any> = {}
    ): Promise<AnalysisResult> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(
            `${API_URL}${API_VERSION}/documents/${documentId}/analyze`,
            {
                method: 'POST',
                headers: this.getHeaders(token),
                body: JSON.stringify({
                    analysis_type: analysisType,
                    parameters
                }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to start analysis');
        }

        return response.json();
    }

    async getDocumentAnalyses(documentId: string): Promise<AnalysisResult[]> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(
            `${API_URL}${API_VERSION}/documents/${documentId}/analyses`,
            {
                headers: this.getHeaders(token),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch analyses');
        }

        return response.json();
    }

    async getAnalysisResult(analysisId: string): Promise<AnalysisResult> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(
            `${API_URL}${API_VERSION}/documents/analysis/${analysisId}`,
            {
                headers: this.getHeaders(token),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch analysis result');
        }

        return response.json();
    }

    async exportAnalysisResults(documentId: string, format: 'pdf' | 'docx' | 'xlsx'): Promise<Blob> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(
            `${API_URL}${API_VERSION}/documents/${documentId}/export`,
            {
                method: 'POST',
                headers: this.getHeaders(token),
                body: JSON.stringify({ format }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to export analysis results');
        }

        return response.blob();
    }
}

export const analysisService = new AnalysisService(); 