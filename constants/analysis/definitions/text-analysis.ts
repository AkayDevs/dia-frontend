/**
 * Text analysis steps
 */
import { AnalysisDefinitionIcon, AnalysisDefinitionName, AnalysisStep, BaseAnalysisDefinition, ErrorMessages, SuccessMessages } from './base-analysis';

// Define the interface for text analysis constants
export interface TextAnalysisDefinition extends BaseAnalysisDefinition {
    // Base properties are inherited

    // Text-specific properties
    DEFAULT_TEXT_EXTRACTION_OPTIONS: any;
    DEFAULT_TEXT_PROCESSING_OPTIONS: any;
    TEXT_CONFIDENCE_THRESHOLDS: any;
    SUPPORTED_LANGUAGES: string[];
}

export const TEXT_ANALYSIS_DEFINITION_NAME: AnalysisDefinitionName = {
    name: 'Text Analysis'
};

export const TEXT_ANALYSIS_STEPS: AnalysisStep[] = [
    {
        step_code: 'text_analysis.text_extraction',
        name: 'Text Extraction',
        description: 'Extract text from the document',
        order: 1
    },
    {
        step_code: 'text_analysis.text_processing',
        name: 'Text Processing',
        description: 'Process and structure extracted text',
        order: 2
    },
    {
        step_code: 'text_analysis.text_analysis',
        name: 'Text Analysis',
        description: 'Analyze processed text',
        order: 3
    }
];

export const TEXT_ANALYSIS_DEFINITION_ICON: AnalysisDefinitionIcon = {
    icon: 'DocumentTextIcon'
};

/**
 * Text analysis error messages
 */
export const TEXT_ANALYSIS_ERROR_MESSAGES: ErrorMessages = {
    NO_TEXT_FOUND: 'No text was extracted from the document',
    LOW_CONFIDENCE: 'Text was extracted with low confidence',
    PROCESSING_FAILED: 'Failed to process extracted text',
    ANALYSIS_FAILED: 'Text analysis failed'
};

/**
 * Text analysis success messages
 */
export const TEXT_ANALYSIS_SUCCESS_MESSAGES: SuccessMessages = {
    TEXT_EXTRACTED: 'Text successfully extracted',
    TEXT_PROCESSED: 'Text successfully processed',
    ANALYSIS_COMPLETED: 'Text analysis completed'
};

/**
 * Default text extraction options
 */
export const DEFAULT_TEXT_EXTRACTION_OPTIONS = {
    confidence_threshold: 0.7,
    include_layout: true
};

/**
 * Default text processing options
 */
export const DEFAULT_TEXT_PROCESSING_OPTIONS = {
    normalize: true,
    remove_special_chars: false
};

/**
 * Text confidence thresholds
 */
export const TEXT_CONFIDENCE_THRESHOLDS = {
    high: 0.9,
    medium: 0.7,
    low: 0.5
};

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = [
    'en', 'fr', 'de', 'es', 'it'
]; 