import { AnalysisDefinitionCode } from '@/enums/analysis';
import * as TableConstants from './definitions/table-analysis';
import * as TextConstants from './definitions/text-analysis';

// Define interfaces for the constants
interface TableAnalysisConstants {
    TABLE_ANALYSIS_STEPS: any[];
    DEFAULT_TABLE_DETECTION_OPTIONS: any;
    DEFAULT_TABLE_EXTRACTION_OPTIONS: any;
    TABLE_CONFIDENCE_THRESHOLDS: any;
    TABLE_ANALYSIS_ERROR_MESSAGES: any;
    TABLE_ANALYSIS_SUCCESS_MESSAGES: any;
}

interface TextAnalysisConstants {
    TEXT_ANALYSIS_STEPS: any[];
    DEFAULT_TEXT_EXTRACTION_OPTIONS: any;
    DEFAULT_TEXT_PROCESSING_OPTIONS: any;
    TEXT_CONFIDENCE_THRESHOLDS: any;
    TEXT_ANALYSIS_ERROR_MESSAGES: any;
    TEXT_ANALYSIS_SUCCESS_MESSAGES: any;
    SUPPORTED_LANGUAGES: any[];
}

type AnalysisConstantsMap = {
    [AnalysisDefinitionCode.TABLE_ANALYSIS]: TableAnalysisConstants;
    [AnalysisDefinitionCode.TEXT_ANALYSIS]: TextAnalysisConstants;
};

/**
 * Analysis constants registry
 * Maps analysis type codes to their constants
 */
export const ANALYSIS_CONSTANTS_REGISTRY = {
    [AnalysisDefinitionCode.TABLE_ANALYSIS]: TableConstants as unknown as TableAnalysisConstants,
    [AnalysisDefinitionCode.TEXT_ANALYSIS]: TextConstants as unknown as TextAnalysisConstants,
    // Add other analysis types as needed
};

/**
 * Get constants for a specific analysis type
 */
export function getAnalysisConstants(analysisType: string): TableAnalysisConstants | TextAnalysisConstants {
    if (!Object.values(AnalysisDefinitionCode).includes(analysisType as AnalysisDefinitionCode)) {
        throw new Error(`Invalid analysis type: ${analysisType}`);
    }

    const constants = ANALYSIS_CONSTANTS_REGISTRY[analysisType as keyof typeof ANALYSIS_CONSTANTS_REGISTRY];

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
            return (constants as TableAnalysisConstants).TABLE_ANALYSIS_STEPS;
        case AnalysisDefinitionCode.TEXT_ANALYSIS:
            return (constants as TextAnalysisConstants).TEXT_ANALYSIS_STEPS;
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
                tableOptions: (constants as TableAnalysisConstants).DEFAULT_TABLE_DETECTION_OPTIONS,
                extractionOptions: (constants as TableAnalysisConstants).DEFAULT_TABLE_EXTRACTION_OPTIONS
            };
        case AnalysisDefinitionCode.TEXT_ANALYSIS:
            return {
                extractionOptions: (constants as TextAnalysisConstants).DEFAULT_TEXT_EXTRACTION_OPTIONS,
                processingOptions: (constants as TextAnalysisConstants).DEFAULT_TEXT_PROCESSING_OPTIONS
            };
        default:
            throw new Error(`Default options not found for analysis type: ${analysisType}`);
    }
}
