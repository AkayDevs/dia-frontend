import { DocumentType } from './document';

/**
 * Analysis types supported by the system
 */
export enum AnalysisTypeEnum {
    TABLE_ANALYSIS = 'table_analysis',
    TEXT_ANALYSIS = 'text_analysis',
    TEMPLATE_CONVERSION = 'template_conversion'
}

/**
 * Analysis step types
 */
export enum TableAnalysisStepEnum {
    TABLE_DETECTION = 'table_detection',
    TABLE_STRUCTURE_RECOGNITION = 'table_structure_recognition',
    TABLE_DATA_EXTRACTION = 'table_data_extraction'
}

export enum TextAnalysisStepEnum {
    TEXT_DETECTION = 'text_detection',
    TEXT_RECOGNITION = 'text_recognition',
    TEXT_CLASSIFICATION = 'text_classification'
}

export enum TemplateConversionStepEnum {
    TEMPLATE_DETECTION = 'template_detection',
    TEMPLATE_MATCHING = 'template_matching',
    TEMPLATE_EXTRACTION = 'template_extraction'
}

/**
 * Analysis status types
 */
export enum AnalysisStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

/**
 * Parameter definition
 */
export interface Parameter {
    name: string;
    description: string;
    type: string;
    required: boolean;
    default?: any;
    min_value?: number;
    max_value?: number;
    allowed_values?: any[];
}

/**
 * Algorithm interface
 */
export interface Algorithm {
    id: string;
    name: string;
    description?: string;
    version: string;
    supported_document_types: DocumentType[];
    parameters: Parameter[];
    is_active: boolean;
    step_id: string;
    created_at: string;
    updated_at?: string;
}

/**
 * Analysis step interface
 */
export interface AnalysisStep {
    id: string;
    name: TableAnalysisStepEnum | TextAnalysisStepEnum | TemplateConversionStepEnum;
    description?: string;
    order: number;
    base_parameters: Parameter[];
    analysis_type_id: string;
    created_at: string;
    updated_at?: string;
    algorithms: Algorithm[];
}

/**
 * Analysis type interface
 */
export interface AnalysisType {
    id: string;
    name: AnalysisTypeEnum;
    description?: string;
    supported_document_types: DocumentType[];
    created_at: string;
    updated_at?: string;
    steps: AnalysisStep[];
}

/**
 * Analysis step result interface
 */
export interface AnalysisStepResult {
    id: string;
    analysis_id: string;
    step_id: string;
    algorithm_id: string;
    parameters: Record<string, any>;
    result?: Record<string, any>;
    user_corrections?: Record<string, any>;
    status: string;
    error_message?: string;
    created_at: string;
    updated_at?: string;
    completed_at?: string;
}

/**
 * Analysis interface
 */
export interface Analysis {
    id: string;
    document_id: string;
    analysis_type_id: string;
    mode: 'automatic' | 'step_by_step';
    status: string;
    error_message?: string;
    created_at: string;
    updated_at?: string;
    completed_at?: string;
    step_results: AnalysisStepResult[];
}

/**
 * Analysis request interface
 */
export interface AnalysisRequest {
    analysis_type_id: string;
    mode: 'automatic' | 'step_by_step';
    algorithm_configs: Record<string, {
        algorithm_id: string;
        parameters: Record<string, any>;
    }>;
}

/**
 * Step execution request
 */
export interface StepExecutionRequest {
    algorithm_id: string;
    parameters: Record<string, any>;
}

/**
 * Analysis list parameters
 */
export interface AnalysisListParams {
    status?: AnalysisStatus;
    analysis_type_id?: string;
    document_type?: DocumentType;
    start_date?: Date;
    end_date?: Date;
    skip?: number;
    limit?: number;
}

/**
 * Analysis progress update
 */
export interface AnalysisProgress {
    status: AnalysisStatus;
    progress: number;
    message?: string;
}