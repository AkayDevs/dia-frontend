import { TextExtractionOptions, TextProcessingOptions } from '@/types/analysis/types/text_analysis';

/**
 * Default text extraction options
 */
export const DEFAULT_TEXT_EXTRACTION_OPTIONS: TextExtractionOptions = {
    preserveFormatting: true,
    extractStructuredContent: true,
    detectLanguage: true,
    ocrQuality: 'high',
    includeConfidenceScores: true
};

/**
 * Default text processing options
 */
export const DEFAULT_TEXT_PROCESSING_OPTIONS: TextProcessingOptions = {
    removeHeadersFooters: true,
    normalizeWhitespace: true,
    detectParagraphs: true,
    detectLists: true,
    detectTables: false,
    extractMetadata: true
};

/**
 * Text analysis steps
 */
export const TEXT_ANALYSIS_STEPS = [
    {
        id: 'text_extraction',
        name: 'Text Extraction',
        description: 'Extract text from the document',
        order: 1
    },
    {
        id: 'text_processing',
        name: 'Text Processing',
        description: 'Process and structure extracted text',
        order: 2
    },
    {
        id: 'text_analysis',
        name: 'Text Analysis',
        description: 'Analyze processed text',
        order: 3
    }
];

/**
 * Text confidence thresholds
 */
export const TEXT_CONFIDENCE_THRESHOLDS = {
    LOW: 0.6,
    MEDIUM: 0.8,
    HIGH: 0.95
};

/**
 * Text analysis error messages
 */
export const TEXT_ANALYSIS_ERROR_MESSAGES = {
    NO_TEXT_FOUND: 'No text was extracted from the document',
    LOW_CONFIDENCE: 'Text was extracted with low confidence',
    PROCESSING_FAILED: 'Failed to process extracted text',
    ANALYSIS_FAILED: 'Text analysis failed'
};

/**
 * Text analysis success messages
 */
export const TEXT_ANALYSIS_SUCCESS_MESSAGES = {
    TEXT_EXTRACTED: 'Text successfully extracted',
    TEXT_PROCESSED: 'Text successfully processed',
    ANALYSIS_COMPLETED: 'Text analysis completed'
};

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' }
]; 