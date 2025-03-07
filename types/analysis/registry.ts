import { AnalysisRunInfo, StepResultResponse } from './base';
import { AnalysisDefinitionCode, TableAnalysisStepCode } from '@/enums/analysis';

// Import table analysis types
import {
    TableDetectionOutput,
    TableStructureOutput,
    TableDataOutput
} from './definitions/table_analysis';

/**
 * Table analysis result interface
 * Maps step codes to their output types
 */
export interface TableAnalysisStepOutputRegistry {
    [TableAnalysisStepCode.TABLE_DETECTION]: TableDetectionOutput;
    [TableAnalysisStepCode.TABLE_STRUCTURE]: TableStructureOutput;
    [TableAnalysisStepCode.TABLE_DATA]: TableDataOutput;
}


/**
 * Type guard for table detection step result
 */
export function isTableDetectionResult(result: StepResultResponse): result is StepResultResponse & { result: TableDetectionOutput } {
    return result.step_code === TableAnalysisStepCode.TABLE_DETECTION;
}

/**
 * Type guard for table structure step result
 */
export function isTableStructureResult(result: StepResultResponse): result is StepResultResponse & { result: TableStructureOutput } {
    return result.step_code === TableAnalysisStepCode.TABLE_STRUCTURE;
}

/**
 * Type guard for table data step result
 */
export function isTableDataResult(result: StepResultResponse): result is StepResultResponse & { result: TableDataOutput } {
    return result.step_code === TableAnalysisStepCode.TABLE_DATA;
}

/**
 * Get the output type for a table analysis step code
 */
export type TableAnalysisStepOutputType<T extends TableAnalysisStepCode> = TableAnalysisStepOutputRegistry[T];