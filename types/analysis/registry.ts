import { BaseAnalysisRun, BaseAnalysisStepResult } from './base';
import { TableAnalysisConfig, TableAnalysisResult } from './types/table';
import { TextAnalysisConfig, TextAnalysisResult } from './types/text';

/**
 * Analysis type codes
 */
export enum AnalysisDefinitionCode {
    TABLE_ANALYSIS = 'table_analysis',
    TEXT_ANALYSIS = 'text_analysis',
    // Add other analysis types as needed
}

/**
 * Analysis configuration registry
 * Maps analysis type codes to their configuration types
 */
export interface AnalysisConfigRegistry {
    [AnalysisDefinitionCode.TABLE_ANALYSIS]: TableAnalysisConfig;
    [AnalysisDefinitionCode.TEXT_ANALYSIS]: TextAnalysisConfig;
    // Add other analysis types as needed
}

/**
 * Analysis result registry
 * Maps analysis type codes to their result types
 */
export interface AnalysisResultRegistry {
    [AnalysisDefinitionCode.TABLE_ANALYSIS]: TableAnalysisResult;
    [AnalysisDefinitionCode.TEXT_ANALYSIS]: TextAnalysisResult;
    // Add other analysis types as needed
}

/**
 * Type guard for table analysis configuration
 */
export function isTableAnalysisConfig(config: BaseAnalysisRun): config is TableAnalysisConfig {
    return config.type === AnalysisDefinitionCode.TABLE_ANALYSIS;
}

/**
 * Type guard for text analysis configuration
 */
export function isTextAnalysisConfig(config: BaseAnalysisRun): config is TextAnalysisConfig {
    return config.type === AnalysisDefinitionCode.TEXT_ANALYSIS;
}

/**
 * Type guard for table analysis result
 */
export function isTableAnalysisResult(result: BaseAnalysisStepResult): result is TableAnalysisResult {
    return result.type === AnalysisDefinitionCode.TABLE_ANALYSIS;
}

/**
 * Type guard for text analysis result
 */
export function isTextAnalysisResult(result: BaseAnalysisStepResult): result is TextAnalysisResult {
    return result.type === AnalysisDefinitionCode.TEXT_ANALYSIS;
}

/**
 * Get the configuration type for an analysis type code
 */
export type AnalysisConfigType<T extends AnalysisDefinitionCode> = AnalysisConfigRegistry[T];

/**
 * Get the result type for an analysis type code
 */
export type AnalysisResultType<T extends AnalysisDefinitionCode> = AnalysisResultRegistry[T];