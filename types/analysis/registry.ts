import { AnalysisRunWithResults } from './base';
import { TableAnalysisResult } from './types/table_analysis';
import { TextAnalysisResult } from './types/text_analysis';

/**
 * Analysis type codes
 */
export enum AnalysisDefinitionCode {
    TABLE_ANALYSIS = 'table_analysis',
    TEXT_ANALYSIS = 'text_analysis',
    // For future use
}

/**
 * Analysis result registry
 * Maps analysis type codes to their result types
 */
export interface AnalysisResultRegistry {
    [AnalysisDefinitionCode.TABLE_ANALYSIS]: TableAnalysisResult;
    [AnalysisDefinitionCode.TEXT_ANALYSIS]: TextAnalysisResult;
    // For future use
}

/**
 * Type guard for table analysis result
 */
export function isTableAnalysisResult(result: AnalysisRunWithResults): result is TableAnalysisResult {
    return result.type === AnalysisDefinitionCode.TABLE_ANALYSIS;
}

/**
 * Type guard for text analysis result
 */
export function isTextAnalysisResult(result: AnalysisRunWithResults): result is TextAnalysisResult {
    return result.type === AnalysisDefinitionCode.TEXT_ANALYSIS;
}


/**
 * Get the result type for an analysis type code
 */
export type AnalysisResultType<T extends AnalysisDefinitionCode> = AnalysisResultRegistry[T];