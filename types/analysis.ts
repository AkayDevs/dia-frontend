import { AnalysisStatus } from './document';

/**
 * Analysis types supported by the system
 */
export enum AnalysisType {
    TABLE_DETECTION = 'table_detection',
    TEXT_EXTRACTION = 'text_extraction',
    TEXT_SUMMARIZATION = 'text_summarization',
    TEMPLATE_CONVERSION = 'template_conversion'
}

/**
 * Base analysis configuration
 */
export interface AnalysisConfig {
    type: AnalysisType;
    name: string;
    description: string;
    supported_formats: string[];
    parameters: Record<string, any>;
}

/**
 * Analysis task request
 */
export interface AnalysisRequest {
    analysis_type: AnalysisType;
    parameters?: Record<string, any>;
}

/**
 * Analysis task response
 */
export interface AnalysisResponse {
    id: string;
    document_id: string;
    type: AnalysisType;
    status: AnalysisStatus;
    result?: Record<string, any>;
    error?: string;
    created_at: string;
    completed_at?: string;
    progress: number;
    parameters: Record<string, any>;
}



/**
 * Analysis task list parameters
 */
export interface AnalysisListParams {
    document_id?: string;
    status?: AnalysisStatus;
    type?: AnalysisType;
    skip?: number;
    limit?: number;
}

/**
 * Analysis task list response
 */
export interface AnalysisListResponse {
    items: AnalysisResponse[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

/**
 * Analysis progress update
 */
export interface AnalysisProgress {
    status: AnalysisStatus;
    progress: number;
    message?: string;
}

/**
 * Analysis result with metadata
 */
export interface AnalysisResultWithMetadata {
    id: string;
    type: AnalysisType;
    result: Record<string, any>;
    metadata: {
        processing_time: number;
        confidence_score?: number;
        version: string;
    };
    created_at: string;
} 


/**
 * Analysis result interface
 */
export interface AnalysisResult {
    id: string;
    type: string;
    result: Record<string, any>;
    created_at: string;
}
