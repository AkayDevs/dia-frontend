import { AnalysisMode, AnalysisStatus, AlgorithmSelection } from './analysis_configs';

/**
 * Step configuration interface
 */
export interface StepConfig {
    algorithm?: AlgorithmSelection;
    enabled: boolean;
    timeout?: number;
    retry?: number;
}

/**
 * Notification configuration interface
 */
export interface NotificationConfig {
    notify_on_completion: boolean;
    notify_on_failure: boolean;
    websocket_channel?: string;
}

/**
 * Complete analysis run configuration
 */
export interface AnalysisRunConfig {
    steps: Record<string, StepConfig>;
    notifications: NotificationConfig;
    metadata: Record<string, any>;
}

/**
 * Base analysis run interface
 */
export interface AnalysisRunBase {
    document_id: string;
    analysis_code: string;
    mode: AnalysisMode;
    config: AnalysisRunConfig;
}

/**
 * Analysis run creation interface
 */
export interface AnalysisRunCreate extends AnalysisRunBase { }

/**
 * Analysis run update interface
 */
export interface AnalysisRunUpdate {
    status?: AnalysisStatus;
    config?: AnalysisRunConfig;
    started_at?: string;
    completed_at?: string;
    error_message?: string;
}

/**
 * Step execution result info interface
 */
export interface StepExecutionResultInfo {
    id: string;
    step_definition_id: string;
    analysis_run_id: string;
    algorithm_definition_id?: string;
    parameters: Record<string, any>;
    status: AnalysisStatus;
    result?: Record<string, any>;
    error_message?: string;
    started_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at?: string;
    user_corrections?: Record<string, any>;
}

/**
 * Analysis run in database interface
 */
export interface AnalysisRunInDB extends AnalysisRunBase {
    id: string;
    status: AnalysisStatus;
    created_at: string;
    updated_at?: string;
    started_at?: string;
    completed_at?: string;
    error_message?: string;
}

/**
 * Analysis run info interface
 */
export interface AnalysisRunInfo extends AnalysisRunInDB { }

/**
 * Analysis run with results interface
 */
export interface AnalysisRunWithResults extends AnalysisRunInfo {
    step_results: StepExecutionResultInfo[];
}

/**
 * Analysis run list parameters
 */
export interface AnalysisRunListParams {
    status?: AnalysisStatus;
    analysis_definition_id?: string;
    document_type?: string;
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
}
