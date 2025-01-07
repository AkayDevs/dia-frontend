import { API_URL, API_VERSION } from '@/lib/constants';
import { BaseResponse } from '@/types/base';
import {
    AnalysisType,
    AnalysisConfig,
    AnalysisRequest,
    AnalysisResponse,
    AnalysisListParams,
    AnalysisListResponse,
    AnalysisProgress,
    AnalysisResultWithMetadata,
} from '@/types/analysis';

class AnalysisService {
    private baseUrl = `${API_URL}${API_VERSION}/analysis`;

    // Helper method for common fetch options
    private getHeaders(isFormData: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Accept': 'application/json',
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const token = localStorage.getItem('access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    // Helper method to handle errors
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || error.message || 'An error occurred');
        }
        return response.json();
    }

    /**
     * Start a new analysis task single file upload { create analysis task }
     */
    async startAnalysis(request: AnalysisRequest, document_id: string): Promise<AnalysisResponse> {
        const response = await fetch(`${this.baseUrl}/${document_id}`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(request),
        });

        return this.handleResponse<AnalysisResponse>(response);
    }

    /**
     * Get analysis task status and progress { get analysis task status }
     */
    async getAnalysisStatus(analysisId: string): Promise<AnalysisResponse> {
        const response = await fetch(`${this.baseUrl}/${analysisId}`, {
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<AnalysisResponse>(response);
    }

    /**
     * List analysis tasks with filtering
     */
    async listAnalysisTasks(params: AnalysisListParams = {}): Promise<AnalysisListResponse> {
        const queryParams = new URLSearchParams();

        if (params.document_id) queryParams.append('document_id', params.document_id);
        if (params.status) queryParams.append('status', params.status);
        if (params.type) queryParams.append('type', params.type);
        if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());

        const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<AnalysisListResponse>(response);
    }

    /**
     * Cancel an ongoing analysis task
     */
    async cancelAnalysis(analysisId: string): Promise<BaseResponse> {
        const response = await fetch(`${this.baseUrl}/${analysisId}/cancel`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<BaseResponse>(response);
    }

    /**
     * Get available analysis types and parameters
     */
    async getAnalysisConfigs(): Promise<AnalysisConfig[]> {
        const response = await fetch(`${this.baseUrl}/types`, {
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<AnalysisConfig[]>(response);
    }

    /**
     * Retry a failed analysis task
     */
    async retryAnalysis(analysisId: string): Promise<AnalysisResponse> {
        const response = await fetch(`${this.baseUrl}/${analysisId}/retry`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<AnalysisResponse>(response);
    }

    /**
     * Get analysis task history for a document
     */
    async getDocumentAnalysisHistory(documentId: string): Promise<AnalysisResponse[]> {
        const response = await fetch(`${this.baseUrl}/document/${documentId}`, {
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<AnalysisResponse[]>(response);
    }
}

export const analysisService = new AnalysisService(); 