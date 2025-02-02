import { BoundingBox, Confidence, PageInfo } from './shared';

/**
 * Standard cell information.
 */
export interface Cell {
    /** Bounding box coordinates of the cell */
    bbox: BoundingBox;
    /** Number of rows this cell spans */
    row_span: number;
    /** Number of columns this cell spans */
    col_span: number;
    /** Whether this cell is a header */
    is_header: boolean;
    /** Confidence score for the cell detection */
    confidence: Confidence;
}

/**
 * Standard table structure information.
 */
export interface TableStructure {
    /** Bounding box coordinates of the table */
    bbox: BoundingBox;
    /** List of cells in the table */
    cells: Cell[];
    /** Number of rows in the table */
    num_rows: number;
    /** Number of columns in the table */
    num_cols: number;
    /** Confidence score for the structure detection */
    confidence: Confidence;
    metadata?: Record<string, any>;
}

/**
 * Standard output for table structure recognition step.
 */
export interface TableStructureResult {
    /** Information about the page being processed */
    page_info: PageInfo;
    /** List of detected table structures on the page */
    tables: TableStructure[];
    /** Additional processing information */
    processing_info: Record<string, any>;
}

/**
 * Complete output for table structure recognition.
 */
export interface TableStructureOutput {
    /** Total number of pages that were processed */
    total_pages_processed: number;
    /** Total number of tables that were processed */
    total_tables_processed: number;
    /** Results for each processed page */
    results: TableStructureResult[];
    /** Additional metadata about the analysis */
    metadata: Record<string, any>;
}
