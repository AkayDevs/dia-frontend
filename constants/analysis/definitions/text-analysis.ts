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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>'
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