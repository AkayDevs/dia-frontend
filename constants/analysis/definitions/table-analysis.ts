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
        step_code: 'table_analysis.table_structure',
        name: 'Table Structure',
        description: 'Extract table structure from the detected tables',
        order: 2
    },
    {
        step_code: 'table_analysis.table_data',
        name: 'Table Data',
        description: 'Extract data from the detected tables',
        order: 3
    }
];

export const TABLE_ANALYSIS_DEFINITION_ICON: AnalysisDefinitionIcon = {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 text-primary"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>'
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