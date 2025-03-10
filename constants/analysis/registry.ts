import * as TableConstants from './definitions/table-analysis';
import * as TextConstants from './definitions/text-analysis';
import { BaseAnalysisDefinition } from './definitions/base-analysis';
import { TableAnalysisDefinition } from './definitions/table-analysis';
import { TextAnalysisDefinition } from './definitions/text-analysis';

/**
 * Analysis definition code enum
 */
export enum AnalysisDefinitionCode {
    TABLE_ANALYSIS = 'table_analysis',
    TEXT_ANALYSIS = 'text_analysis'
}

// Type for the analysis constants map
type AnalysisConstantsMap = {
    [AnalysisDefinitionCode.TABLE_ANALYSIS]: TableAnalysisDefinition;
    [AnalysisDefinitionCode.TEXT_ANALYSIS]: TextAnalysisDefinition;
};

/**
 * Analysis constants registry
 * Maps analysis type codes to their constants
 */
export const ANALYSIS_CONSTANTS_REGISTRY: AnalysisConstantsMap = {
    [AnalysisDefinitionCode.TABLE_ANALYSIS]: {
        ANALYSIS_DEFINITION_NAME: TableConstants.TABLE_ANALYSIS_DEFINITION_NAME,
        ANALYSIS_STEPS: TableConstants.TABLE_ANALYSIS_STEPS,
        ANALYSIS_DEFINITION_ICON: TableConstants.TABLE_ANALYSIS_DEFINITION_ICON,
        ERROR_MESSAGES: TableConstants.TABLE_ANALYSIS_ERROR_MESSAGES,
        SUCCESS_MESSAGES: TableConstants.TABLE_ANALYSIS_SUCCESS_MESSAGES,
        TABLE_CONFIDENCE_THRESHOLDS: TableConstants.TABLE_CONFIDENCE_THRESHOLDS,
    } as TableAnalysisDefinition,

    [AnalysisDefinitionCode.TEXT_ANALYSIS]: {
        ANALYSIS_DEFINITION_NAME: TextConstants.TEXT_ANALYSIS_DEFINITION_NAME,
        ANALYSIS_STEPS: TextConstants.TEXT_ANALYSIS_STEPS,
        ANALYSIS_DEFINITION_ICON: TextConstants.TEXT_ANALYSIS_DEFINITION_ICON,
        ERROR_MESSAGES: TextConstants.TEXT_ANALYSIS_ERROR_MESSAGES,
        SUCCESS_MESSAGES: TextConstants.TEXT_ANALYSIS_SUCCESS_MESSAGES,
        DEFAULT_TEXT_EXTRACTION_OPTIONS: TextConstants.DEFAULT_TEXT_EXTRACTION_OPTIONS,
        DEFAULT_TEXT_PROCESSING_OPTIONS: TextConstants.DEFAULT_TEXT_PROCESSING_OPTIONS,
        TEXT_CONFIDENCE_THRESHOLDS: TextConstants.TEXT_CONFIDENCE_THRESHOLDS,
        SUPPORTED_LANGUAGES: TextConstants.SUPPORTED_LANGUAGES,
    } as TextAnalysisDefinition
};

/**
 * Get constants for a specific analysis type
 */
export function getAnalysisConstants<T extends BaseAnalysisDefinition>(analysisType: string): T {
    // If analysisType is empty or undefined, default to TABLE_ANALYSIS
    if (!analysisType) {
        return ANALYSIS_CONSTANTS_REGISTRY[AnalysisDefinitionCode.TABLE_ANALYSIS] as unknown as T;
    }

    if (!Object.values(AnalysisDefinitionCode).includes(analysisType as AnalysisDefinitionCode)) {
        throw new Error(`Invalid analysis type: ${analysisType}`);
    }

    const constants = ANALYSIS_CONSTANTS_REGISTRY[analysisType as keyof typeof ANALYSIS_CONSTANTS_REGISTRY];

    if (!constants) {
        throw new Error(`Constants not found for analysis type: ${analysisType}`);
    }

    // Use unknown as an intermediate type to avoid TypeScript error
    return constants as unknown as T;
}

/**
 * Get the name of a specific analysis type
 */
export function getAnalysisName(analysisType: string) {
    const constants = getAnalysisConstants<BaseAnalysisDefinition>(analysisType);
    return constants.ANALYSIS_DEFINITION_NAME;
}

/**
 * Get steps for a specific analysis type
 */
export function getAnalysisSteps(analysisType: string) {
    const constants = getAnalysisConstants<BaseAnalysisDefinition>(analysisType);
    return constants.ANALYSIS_STEPS;
}

/**
 * Get the icon for a specific analysis type
 */
export function getAnalysisIcon(analysisType: string) {
    const constants = getAnalysisConstants<BaseAnalysisDefinition>(analysisType);
    return constants.ANALYSIS_DEFINITION_ICON;
}

/**
 * Get error messages for a specific analysis type
 */
export function getAnalysisErrorMessages(analysisType: string) {
    const constants = getAnalysisConstants<BaseAnalysisDefinition>(analysisType);
    return constants.ERROR_MESSAGES;
}

/**
 * Get success messages for a specific analysis type
 */
export function getAnalysisSuccessMessages(analysisType: string) {
    const constants = getAnalysisConstants<BaseAnalysisDefinition>(analysisType);
    return constants.SUCCESS_MESSAGES;
}
