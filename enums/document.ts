/**
 * Document type enum
 */
export enum DocumentType {
    PDF = 'pdf',
    DOCX = 'docx',
    XLSX = 'xlsx',
    IMAGE = 'image',
    UNKNOWN = 'unknown'
}

/**
 * Document analysis status enum
 */
export enum AnalysisStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}