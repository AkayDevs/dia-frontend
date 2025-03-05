import { AnalysisStatus, AnalysisMode } from '@/enums/analysis';

export interface AnalysisRunRequest {
  document_id: string;
  analysis_code: string;
  mode: AnalysisMode;
  config: AnalysisRunConfig;
}

export interface AnalysisRunConfig {
  steps: Record<string, AnalysisStepConfig>;
  notifications: NotificationConfig;
  metadata: Record<string, any>;
}

export interface AnalysisStepConfig {
  algorithm?: AnalysisAlgorithmConfig;
  enabled: boolean;
  timeout?: number;
  retry?: number;
}

export interface AnalysisAlgorithmConfig {
  code: string;
  version: string;
  parameters?: Record<string, AlgorithmParameterValue>;
}

export interface AlgorithmParameterValue {
  name: string;
  value: any;
}

export interface NotificationConfig {
  notify_on_completion: boolean;
  notify_on_failure: boolean;
  websocket_channel?: string;
}

/**
 * Analysis run response
 * This is the response from the server for an analysis run request
 */

export interface AnalysisRunInfo extends AnalysisRunRequest {
  id?: string;
  status?: AnalysisStatus;
  type: string;
  created_at: string;
  updated_at?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface AnalysisRunWithResults extends AnalysisRunInfo {
  step_results: StepResultResponse[];
}


/**
 * Analysis result response
 * This is the response from the server for an analysis result request
 */

export interface StepResultResponse {
  id: string;
  step_code: string;
  algorithm_code: string;
  status: AnalysisStatus;
  parameters: Record<string, any>;
  result: Record<string, any>;
  user_corrections: Record<string, any>;
  retry_count: number;
  created_at: string;
  updated_at?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}




