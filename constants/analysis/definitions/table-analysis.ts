/**
 * Table analysis steps
 */
import { AnalysisDefinitionIcon, AnalysisDefinitionName, AnalysisStep, BaseAnalysisDefinition, ErrorMessages, SuccessMessages } from './base-analysis';

// Define the interface for table analysis constants
export interface TableAnalysisDefinition extends BaseAnalysisDefinition {
    // Base properties are inherited

    // Table-specific properties
    TABLE_CONFIDENCE_THRESHOLDS: any;
}

export const TABLE_ANALYSIS_DEFINITION_NAME: AnalysisDefinitionName = {
    name: 'Table Analysis'
};

export const TABLE_ANALYSIS_STEPS: AnalysisStep[] = [
    {
        step_code: 'table_analysis.table_detection',
        name: 'Table Detection',
        description: 'Detect tables in the document',
        order: 1
    },
    {
        step_code: 'table_analysis.table_extraction',
        name: 'Table Extraction',
        description: 'Extract data from detected tables',
        order: 2
    },
    {
        step_code: 'table_analysis.table_validation',
        name: 'Table Validation',
        description: 'Validate extracted table data',
        order: 3
    }
];

export const TABLE_ANALYSIS_DEFINITION_ICON: AnalysisDefinitionIcon = {
    icon: 'TableCellsIcon'
};

/**
 * Table analysis error messages
 */
export const TABLE_ANALYSIS_ERROR_MESSAGES: ErrorMessages = {
    NO_TABLES_FOUND: 'No tables were detected in the document',
    LOW_CONFIDENCE: 'Tables were detected with low confidence',
    EXTRACTION_FAILED: 'Failed to extract data from detected tables',
    VALIDATION_FAILED: 'Table data validation failed'
};

/**
 * Table analysis success messages
 */
export const TABLE_ANALYSIS_SUCCESS_MESSAGES: SuccessMessages = {
    TABLES_DETECTED: 'Tables successfully detected',
    DATA_EXTRACTED: 'Table data successfully extracted',
    VALIDATION_PASSED: 'Table data validation passed'
};

/**
 * Table confidence thresholds
 */
export const TABLE_CONFIDENCE_THRESHOLDS = {
    high: 0.9,
    medium: 0.7,
    low: 0.5
}; 