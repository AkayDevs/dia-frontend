import { API_URL, API_VERSION } from '@/lib/constants';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import {
    AnalysisType,
    AnalysisConfig,
    AnalysisRequest,
    AnalysisResponse,
    AnalysisListParams,
    AnalysisProgress,
    BatchAnalysisRequest,
    BatchAnalysisResponse
} from '@/types/analysis';

class AnalysisService {
    private baseUrl = `${API_URL}${API_VERSION}/analysis`;

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
     * Get available analysis types
     */
    async getAvailableTypes(): Promise<AnalysisConfig[]> {
        const response = await fetch(`${this.baseUrl}/types`, {
            headers: this.getHeaders(),
        });

        return await this.handleResponse<AnalysisConfig[]>(response);
    }

    /**
     * Start a new analysis
     */
    async startAnalysis(documentId: string, request: AnalysisRequest): Promise<AnalysisResponse> {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        });

        return this.handleResponse<AnalysisResponse>(response);
    }

    /**
     * Cancel an ongoing analysis
     */
    async cancelAnalysis(analysisId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${analysisId}/cancel`, {
            method: 'POST',
            headers: this.getHeaders(),
        });

        await this.handleResponse<void>(response);
    }

    /**
     * Retry a failed analysis
     */
    async retryAnalysis(analysisId: string): Promise<AnalysisResponse> {
        const response = await fetch(`${this.baseUrl}/${analysisId}/retry`, {
            method: 'POST',
            headers: this.getHeaders(),
        });

        return this.handleResponse<AnalysisResponse>(response);
    }

    /**
     * Get list of analyses with optional filtering
     */
    async getAnalyses(params: AnalysisListParams = {}): Promise<AnalysisResponse[]> {
        const queryParams = new URLSearchParams();

        if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params.status) queryParams.append('status', params.status);
        if (params.analysis_type) queryParams.append('analysis_type', params.analysis_type);
        if (params.document_id) queryParams.append('document_id', params.document_id);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<AnalysisResponse[]>(response);
    }

    /**
     * Get analysis by ID
     */
    async getAnalysis(analysisId: string): Promise<AnalysisResponse> {
        const response = await fetch(`${this.baseUrl}/${analysisId}`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<AnalysisResponse>(response);
    }

    /**
     * Get analysis progress
     */
    async getAnalysisProgress(analysisId: string): Promise<AnalysisProgress> {
        const response = await fetch(`${this.baseUrl}/${analysisId}/progress`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<AnalysisProgress>(response);
    }
}

export const analysisService = new AnalysisService(); 