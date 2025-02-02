import { BoundingBox, Confidence, PageInfo } from './shared';

/**
 * Standard table location information.
 */
export interface TableLocation {
    /** Bounding box coordinates of the table */
    bbox: BoundingBox;
    /** Confidence score for the detection */
    confidence: Confidence;
    /** Type of table if detected (e.g., 'bordered', 'borderless') */
    table_type?: string;
}

/**
 * Standard output for table detection step.
 */
export interface TableDetectionResult {
    /** Information about the page being processed */
    page_info: PageInfo;
    /** List of detected tables on the page */
    tables: TableLocation[];
    /** Additional processing information (e.g., parameters used) */
    processing_info: Record<string, any>;
}

/**
 * Complete output for table detection.
 */
export interface TableDetectionOutput {
    /** Total number of pages that were processed */
    total_pages_processed: number;
    /** Total number of tables found across all pages */
    total_tables_found: number;
    /** Results for each processed page */
    results: TableDetectionResult[];
    /** Additional metadata about the analysis */
    metadata: Record<string, any>;
}
