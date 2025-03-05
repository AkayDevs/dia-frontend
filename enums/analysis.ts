/**
 * Analysis definition code enum
 */
export enum AnalysisDefinitionCode {
    TABLE_ANALYSIS = 'table_analysis',
    TEXT_ANALYSIS = 'text_analysis'
}

/**
 * Table analysis step code
 */
export enum TableAnalysisStepCode {
    TABLE_DETECTION = 'table_analysis.table_detection',
    TABLE_STRUCTURE = 'table_analysis.table_structure',
    TABLE_DATA = 'table_analysis.table_data',
}

/**
 * Analysis status enum
 */
export enum AnalysisStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

/**
 * Analysis mode enum
 */
export enum AnalysisMode {
    AUTOMATIC = 'automatic',
    STEP_BY_STEP = 'step_by_step'
}



/**
 * Step status enum
 */
export enum StepStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    SKIPPED = 'skipped'
}