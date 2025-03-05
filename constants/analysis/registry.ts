import { AnalysisDefinitionCode } from '@/types/analysis/registry';
import * as TableConstants from './definitions/table-analysis';
import * as TextConstants from './definitions/text-analysis';

/**
 * Analysis constants registry
 * Maps analysis type codes to their constants
 */
export const ANALYSIS_CONSTANTS_REGISTRY = {
    [AnalysisDefinitionCode.TABLE_ANALYSIS]: TableConstants,
    [AnalysisDefinitionCode.TEXT_ANALYSIS]: TextConstants,
    // Add other analysis types as needed
};

/**
 * Get constants for a specific analysis type
 */
export function getAnalysisConstants(analysisType: string) {
    if (!Object.values(AnalysisDefinitionCode).includes(analysisType as AnalysisDefinitionCode)) {
        throw new Error(`Invalid analysis type: ${analysisType}`);
    }

    const constants = ANALYSIS_CONSTANTS_REGISTRY[analysisType as AnalysisDefinitionCode];

    if (!constants) {
        throw new Error(`Constants not found for analysis type: ${analysisType}`);
    }

    return constants;
}

/**
 * Get steps for a specific analysis type
 */
export function getAnalysisSteps(analysisType: string) {
    const constants = getAnalysisConstants(analysisType);

    switch (analysisType) {
        case AnalysisDefinitionCode.TABLE_ANALYSIS:
            return constants.TABLE_ANALYSIS_STEPS;
        case AnalysisDefinitionCode.TEXT_ANALYSIS:
            return constants.TEXT_ANALYSIS_STEPS;
        default:
            throw new Error(`Steps not found for analysis type: ${analysisType}`);
    }
}

/**
 * Get default options for a specific analysis type
 */
export function getDefaultAnalysisOptions(analysisType: string) {
    const constants = getAnalysisConstants(analysisType);

    switch (analysisType) {
        case AnalysisDefinitionCode.TABLE_ANALYSIS:
            return {
                tableOptions: constants.DEFAULT_TABLE_DETECTION_OPTIONS,
                extractionOptions: constants.DEFAULT_TABLE_EXTRACTION_OPTIONS
            };
        case AnalysisDefinitionCode.TEXT_ANALYSIS:
            return {
                extractionOptions: constants.DEFAULT_TEXT_EXTRACTION_OPTIONS,
                processingOptions: constants.DEFAULT_TEXT_PROCESSING_OPTIONS
            };
        default:
            throw new Error(`Default options not found for analysis type: ${analysisType}`);
    }
}
