// Enums
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export enum AnalysisMode {
    AUTOMATIC = 'automatic',
    STEP_BY_STEP = 'step_by_step'
}


/**
 * Analysis types supported by the system
 */
export enum AnalysisTypeEnum {
    TABLE_ANALYSIS = 'table_analysis',
    TEXT_ANALYSIS = 'text_analysis',
    TEMPLATE_CONVERSION = 'template_conversion'
}

/**
 * 
 *  Step Enum
 * 
 */
    

/**
 * Table analysis step types
 */
export enum TableAnalysisStepEnum {
    TABLE_DETECTION = 'table_detection',
    TABLE_STRUCTURE_RECOGNITION = 'table_structure_recognition',
    TABLE_DATA_EXTRACTION = 'table_data_extraction'
}

/**
 * Text analysis step types
 */
export enum TextAnalysisStepEnum {
    TEXT_DETECTION = 'text_detection',
    TEXT_RECOGNITION = 'text_recognition',
    TEXT_CLASSIFICATION = 'text_classification'
}

/**
 * Template conversion step types
 */
export enum TemplateConversionStepEnum {
    TEMPLATE_DETECTION = 'template_detection',
    TEMPLATE_MATCHING = 'template_matching',
    TEMPLATE_EXTRACTION = 'template_extraction'
}




/**
 * Analysis status types
 */
export enum AnalysisStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    WAITING_FOR_APPROVAL = 'waiting_for_approval'
}
