/**
 * Supported document types
 */
import { AnalysisResult } from './analysis';

export enum DocumentType {
    PDF = 'pdf',
    DOCX = 'docx',
    XLSX = 'xlsx',
    IMAGE = 'image'
}

/**
 * Document analysis status
 */
export enum AnalysisStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

/**
 * Base document interface
 */
export interface DocumentBase {
    name: string;
    type: DocumentType;
    size: number;
    url: string;
}

/**
 * Document response interface
 */
export interface Document extends DocumentBase {
    id: string;
    status: AnalysisStatus;
    uploaded_at: string;
    updated_at?: string;
    user_id: string;
    error_message?: string;
}

/**
 * Document with analysis results
 */
export interface DocumentWithAnalysis extends Document {
    analysis_results: AnalysisResult[];
}

/**
 * Query parameters for document list
 */
export interface DocumentListParams {
    status?: AnalysisStatus;
    doc_type?: DocumentType;
    skip?: number;
    limit?: number;
}

/**
 * Response for document list
 */
export interface DocumentListResponse {
    items: Document[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

/**
 * Analysis parameters for document analysis
 */
export interface AnalysisParameters {
    type: string;
    parameters: Record<string, any>;
}

/**
 * Response for analysis request
 */
export interface AnalysisRequestResponse {
    message: string;
    analysis_id: string;
} 