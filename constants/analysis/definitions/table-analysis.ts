import { TableDetectionOptions, TableExtractionOptions } from '@/types/analysis/types/table_analysis';

/**
 * Default table detection options
 */
export const DEFAULT_TABLE_DETECTION_OPTIONS: TableDetectionOptions = {
    detectHeaderRows: true,
    detectHeaderColumns: true,
    minConfidence: 0.7,
    includeRulings: true,
    extractSpans: true,
    mergeOverlappingCells: true
};

/**
 * Default table extraction options
 */
export const DEFAULT_TABLE_EXTRACTION_OPTIONS: TableExtractionOptions = {
    outputFormat: 'json',
    includeConfidenceScores: true,
    includeCoordinates: true,
    normalizeWhitespace: true
};

/**
 * Table analysis steps
 */
export const TABLE_ANALYSIS_STEPS = [
    {
        id: 'table_detection',
        name: 'Table Detection',
        description: 'Detect tables in the document',
        order: 1
    },
    {
        id: 'table_extraction',
        name: 'Table Extraction',
        description: 'Extract data from detected tables',
        order: 2
    },
    {
        id: 'table_validation',
        name: 'Table Validation',
        description: 'Validate extracted table data',
        order: 3
    }
];

/**
 * Table confidence thresholds
 */
export const TABLE_CONFIDENCE_THRESHOLDS = {
    LOW: 0.5,
    MEDIUM: 0.7,
    HIGH: 0.9
};

/**
 * Table analysis error messages
 */
export const TABLE_ANALYSIS_ERROR_MESSAGES = {
    NO_TABLES_FOUND: 'No tables were detected in the document',
    LOW_CONFIDENCE: 'Tables were detected with low confidence',
    EXTRACTION_FAILED: 'Failed to extract data from detected tables',
    VALIDATION_FAILED: 'Table data validation failed'
};

/**
 * Table analysis success messages
 */
export const TABLE_ANALYSIS_SUCCESS_MESSAGES = {
    TABLES_DETECTED: 'Tables successfully detected',
    DATA_EXTRACTED: 'Table data successfully extracted',
    VALIDATION_PASSED: 'Table data validation passed'
}; 