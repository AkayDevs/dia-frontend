import { API_URL, API_VERSION } from '@/lib/constants';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import { fetchWithAuth } from '@/lib/fetch';
import { DocumentType } from '@/enums/document';
import {
    AnalysisDefinitionCode,
    TableAnalysisStepCode,
    AnalysisStatus,
    AnalysisMode
} from '@/enums/analysis';
import {
    AnalysisDefinitionInfo,
    AnalysisDefinition,
    AnalysisStepInfo,
    AnalysisAlgorithmInfo
} from '@/types/analysis/configs';
import {
    AnalysisRunInfo,
    AnalysisRunWithResults,
    StepResultResponse,
    AnalysisRunConfig,
    AnalysisRunRequest,
    AnalysisRunWithResultsInfo
} from '@/types/analysis/base';

// Define types that were previously in analysis_execution
interface AnalysisRunCreate extends AnalysisRunRequest { }

interface AnalysisRunUpdate {
    status?: AnalysisStatus;
    config?: Partial<AnalysisRunConfig>;
    metadata?: Record<string, any>;
}

interface AnalysisRunListParams {
    status?: string;
    analysis_definition_id?: string;
    document_type?: string;
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
}

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
     * Get list of available analysis definitions
     */
    async getAnalysisDefinitions(): Promise<AnalysisDefinitionInfo[]> {
        const response = await fetch(`${this.baseUrl}/definitions`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<AnalysisDefinitionInfo[]>(response);
    }

    /**
     * Get detailed analysis definition with steps and algorithms
     */
    async getAnalysisDefinition(definitionId: string): Promise<AnalysisDefinition> {
        const response = await fetch(`${this.baseUrl}/definitions/${definitionId}`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<AnalysisDefinition>(response);
    }

    /**
     * Get algorithms for a specific step
     */
    async getStepAlgorithms(stepId: string): Promise<AnalysisAlgorithmInfo[]> {
        const response = await fetch(`${this.baseUrl}/steps/${stepId}/algorithms`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<AnalysisAlgorithmInfo[]>(response);
    }

    /**
     * Start a new analysis
     */
    async startAnalysis(
        documentId: string,
        analysisCode: string,
        mode: AnalysisMode = AnalysisMode.AUTOMATIC,
        config?: AnalysisRunConfig
    ): Promise<AnalysisRunInfo> {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}/analyze?analysis_code=${analysisCode}&mode=${mode}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(config)
        });

        return this.handleResponse<AnalysisRunInfo>(response);
    }

    /**
     * Get list of analyses for a document
     */
    async getDocumentAnalyses(documentId: string): Promise<AnalysisRunWithResults[]> {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}/analyses`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse<AnalysisRunWithResults[]>(response);
    }

    /**
     * Get analysis by ID
     */
    async getAnalysis(analysisId: string): Promise<AnalysisRunWithResults> {
        const response = await fetch(`${this.baseUrl}/analyses/${analysisId}`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<AnalysisRunWithResults>(response);
    }

    /**
     * Execute a specific step in step-by-step mode
     */
    async executeStep(
        analysisId: string,
        stepId: string,
        algorithmId: string,
        parameters?: Record<string, any>
    ): Promise<StepResultResponse> {
        const response = await fetch(
            `${this.baseUrl}/analyses/${analysisId}/steps/${stepId}/execute`,
            {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    algorithm_id: algorithmId,
                    parameters
                }),
            }
        );

        return this.handleResponse<StepResultResponse>(response);
    }

    /**
     * Update user corrections for a step
     */
    async updateStepCorrections(
        analysisId: string,
        stepId: string,
        corrections: Record<string, any>
    ): Promise<StepResultResponse> {
        const response = await fetch(
            `${this.baseUrl}/analyses/${analysisId}/steps/${stepId}/corrections`,
            {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(corrections),
            }
        );

        return this.handleResponse<StepResultResponse>(response);
    }

    /**
     * Get all analyses for the current user with optional filters
     */
    async getUserAnalyses(params?: AnalysisRunListParams): Promise<AnalysisRunWithResultsInfo[]> {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.status) queryParams.append('status', params.status);
            if (params.analysis_definition_id) queryParams.append('analysis_definition_id', params.analysis_definition_id);
            if (params.document_type) queryParams.append('document_type', params.document_type);
            if (params.start_date) queryParams.append('start_date', params.start_date);
            if (params.end_date) queryParams.append('end_date', params.end_date);
            if (params.skip) queryParams.append('skip', params.skip.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
        }

        const url = `${this.baseUrl}/user/analyses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url, {
            headers: this.getHeaders(),
        });

        return this.handleResponse<AnalysisRunWithResultsInfo[]>(response);
    }

    /**
     * Export analysis results in specified format
     */
    async exportResults(analysisId: string, format: 'json' | 'csv'): Promise<Blob> {
        const response = await fetchWithAuth(
            `${this.baseUrl}/${analysisId}/export?format=${format}`,
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

    /**
     * Download analysis results in specified format
     */
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