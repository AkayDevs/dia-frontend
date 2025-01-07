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
    parameters: TableDetectionParameters | TextExtractionParameters | TextSummarizationParameters | TemplateConversionParameters;
}

/**
 * Analysis task request
 */
export interface AnalysisRequest {
    analysis_type: AnalysisType;
    parameters?: TableDetectionParameters | TextExtractionParameters | TextSummarizationParameters | TemplateConversionParameters;
}

/**
 * Analysis task response
 */
export interface AnalysisResponse {
    id: string;
    document_id: string;
    type: AnalysisType;
    status: AnalysisStatus;
    result?: TableDetectionResult | TextExtractionResult | TextSummarizationResult | TemplateConversionResult;
    error?: string;
    created_at: string;
    completed_at?: string;
    progress: number;
    parameters: TableDetectionParameters | TextExtractionParameters | TextSummarizationParameters | TemplateConversionParameters;
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
    result: TableDetectionResult | TextExtractionResult | TextSummarizationResult | TemplateConversionResult;
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
    result: TableDetectionResult | TextExtractionResult | TextSummarizationResult | TemplateConversionResult;
    created_at: string;
}


export interface TableDetectionResult {
    pages: PageTableInfo[];
    total_tables: number;
    average_confidence: number;
    processing_metadata: Record<string, any>;
}

export interface PageTableInfo {
    page_number: number;
    page_dimensions: Record<string, number>;
    tables: DetectedTable[];
}

export interface DetectedTable {
    bbox: BoundingBox;
    confidence_score: number;
    rows: number;
    columns: number;
    cells: TableCell[];
    has_headers: boolean;
    header_rows: number[];
}

export interface TableCell {
    content: string;
    row_index: number;
    col_index: number;
    row_span: number;
    col_span: number;
    is_header: boolean;
    confidence: number;
}

export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface TextExtractionResult {
    text: string;
    pages: PageTextInfo[];
    metadata: Record<string, any>;
}

export interface PageTextInfo {
    page_number: number;
    page_dimensions: Record<string, number>;
    text: string;
}

export interface TextSummarizationResult {
    summary: string;
    original_length: number;
    summary_length: number;
    key_points: string[];
}

export interface TemplateConversionResult {
    converted_file_url: string;
    original_format: string;
    target_format: string;
    conversion_metadata: Record<string, any>;
}

export interface AnalysisParameters {
    confidence_threshold: number;
    max_results: number;
}

export interface TableDetectionParameters extends AnalysisParameters {
    min_row_count: number;
    detect_headers: boolean;
}

export interface TextExtractionParameters extends AnalysisParameters {
    extract_layout: boolean;
    detect_lists: boolean;
}

export interface TextSummarizationParameters extends AnalysisParameters {
    max_length: number;
    min_length: number;
}

export interface TemplateConversionParameters extends AnalysisParameters {
    target_format: string;
    preserve_styles: boolean;
}