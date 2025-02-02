import { DocumentType } from './document';
import { AnalysisStatus, TableAnalysisStepEnum, TextAnalysisStepEnum, TemplateConversionStepEnum, AnalysisTypeEnum, AnalysisMode } from '../lib/enums';
import { Parameter, Algorithm } from './algorithm';


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
    status: AnalysisStatus;
    parameters: Record<string, any>;
    result?: Record<string, any>;
    user_correction?: Record<string, any>;
    created_at: string;
    updated_at?: string;
    completed_at?: string;
    error_message?: string;
}

/**
 * Analysis interface
 */
export interface Analysis {
    id: string;
    document_id: string;
    analysis_type_id: string;
    mode: AnalysisMode;
    status: AnalysisStatus;
    created_at: string;
    updated_at?: string;
    completed_at?: string;
    error_message?: string;
    step_results: AnalysisStepResult[];
}

/**
 * Analysis request interface
 */
export interface AnalysisRequest {
    analysis_type_id: string;
    mode: AnalysisMode;
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