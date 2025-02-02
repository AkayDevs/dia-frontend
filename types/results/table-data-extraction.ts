import { BoundingBox, Confidence, PageInfo } from './shared';

/**
 * Standard cell content information.
 */
export interface CellContent {
    /** Extracted text content */
    text: string;
    /** Confidence score for the extraction */
    confidence: Confidence;
    /** Detected data type (e.g., 'text', 'number', 'date') */
    data_type?: string;
    /** Normalized value if applicable */
    normalized_value?: any;
}

/**
 * Standard table data information.
 */
export interface TableData {
    /** Bounding box coordinates of the table */
    bbox: BoundingBox;
    /** 2D array representing the table */
    cells: CellContent[][];
    /** Confidence score for the data extraction */
    confidence: Confidence;
}

/**
 * Standard output for table data extraction step.
 */
export interface TableDataResult {
    /** Information about the page being processed */
    page_info: PageInfo;
    /** List of processed tables with their data */
    tables: TableData[];
    /** Additional processing information */
    processing_info: Record<string, any>;
}

/**
 * Complete output for table data extraction.
 */
export interface TableDataOutput {
    /** Total number of pages that were processed */
    total_pages_processed: number;
    /** Total number of tables that were processed */
    total_tables_processed: number;
    /** Results for each processed page */
    results: TableDataResult[];
    /** Additional metadata about the analysis */
    metadata: Record<string, any>;
}
