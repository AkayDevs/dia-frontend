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