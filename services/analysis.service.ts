import { API_URL, API_VERSION } from '@/lib/constants';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import { Algorithm } from '@/types/algorithm';
import {
    AnalysisType,
    Analysis,
    AnalysisRequest,
    AnalysisStepResult,
    StepExecutionRequest,
    AnalysisListParams
} from '@/types/analysis';
import { fetchWithAuth } from '@/lib/fetch';

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
    async getAnalysisTypes(): Promise<AnalysisType[]> {
        const response = await fetch(`${this.baseUrl}/types`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<AnalysisType[]>(response);
    }

    /**
     * Get specific analysis type details
     */
    async getAnalysisType(analysisTypeId: string): Promise<AnalysisType> {
        const response = await fetch(`${this.baseUrl}/types/${analysisTypeId}`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<AnalysisType>(response);
    }

    /**
     * Get algorithms for a specific step
     */
    async getStepAlgorithms(stepId: string): Promise<Algorithm[]> {
        const response = await fetch(`${this.baseUrl}/steps/${stepId}/algorithms`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<Algorithm[]>(response);
    }

    /**
     * Start a new analysis
     */
    async startAnalysis(documentId: string, request: AnalysisRequest): Promise<Analysis> {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}/analyze`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        });

        return this.handleResponse<Analysis>(response);
    }

    /**
     * Get list of analyses for a document
     */
    async getDocumentAnalyses(documentId: string): Promise<Analysis[]> {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}/analyses`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse<Analysis[]>(response);
    }

    /**
     * Get analysis by ID
     */
    async getAnalysis(analysisId: string): Promise<Analysis> {
        const response = await fetch(`${this.baseUrl}/analyses/${analysisId}`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<Analysis>(response);
    }

    /**
     * Execute a specific step in step-by-step mode
     */
    async executeStep(
        analysisId: string,
        stepId: string,
        request: StepExecutionRequest
    ): Promise<AnalysisStepResult> {
        const response = await fetch(
            `${this.baseUrl}/analyses/${analysisId}/steps/${stepId}/execute`,
            {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(request),
            }
        );

        return this.handleResponse<AnalysisStepResult>(response);
    }

    /**
     * Update user corrections for a step
     */
    async updateStepCorrections(
        analysisId: string,
        stepId: string,
        corrections: Record<string, any>
    ): Promise<AnalysisStepResult> {
        const response = await fetch(
            `${this.baseUrl}/analyses/${analysisId}/steps/${stepId}/corrections`,
            {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(corrections),
            }
        );

        return this.handleResponse<AnalysisStepResult>(response);
    }

    /**
     * Get all analyses for the current user with optional filters
     */
    async getUserAnalyses(params?: AnalysisListParams): Promise<Analysis[]> {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.status) queryParams.append('status', params.status);
            if (params.analysis_type_id) queryParams.append('analysis_type_id', params.analysis_type_id);
            if (params.document_type) queryParams.append('document_type', params.document_type);
            if (params.start_date) queryParams.append('start_date', params.start_date.toISOString());
            if (params.end_date) queryParams.append('end_date', params.end_date.toISOString());
            if (params.skip) queryParams.append('skip', params.skip.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
        }

        const url = `${this.baseUrl}/user/analyses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<Analysis[]>(response);
    }

    async exportResults(analysisId: string, format: 'json' | 'csv'): Promise<Blob> {
        const response = await fetchWithAuth(
            `${API_URL}/analysis/${analysisId}/export?format=${format}`,
            {
                method: 'GET',
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to export results');
        }

        return response.blob();
    }

    async downloadExport(analysisId: string, format: 'json' | 'csv'): Promise<void> {
        const blob = await this.exportResults(analysisId, format);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analysis_${analysisId}_results.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

export const analysisService = new AnalysisService(); 