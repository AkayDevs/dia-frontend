/**
 * Bounding box
 */
export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

/**
 * Confidence
 */
export interface Confidence {
    score: number;
    method: string;
}

/**
 * Page info
 */
export interface PageInfo {
    page_number: number;
    width: number;
    height: number;
}

/**
 * Base step output
 */
export interface BaseStepOutput {
    total_pages_processed: number;
    total_tables_found: number;
    metadata: Record<string, any>;
}

/**
 * Table detection options
 */
export interface TableDetectionOptions {
    detectHeaderRows: boolean;
    detectHeaderColumns: boolean;
    minConfidence: number;
    includeRulings: boolean;
    extractSpans: boolean;
    mergeOverlappingCells: boolean;
}

/**
 * Table extraction options
 */
export interface TableExtractionOptions {
    outputFormat: 'json' | 'csv' | 'excel';
    includeConfidenceScores: boolean;
    includeCoordinates: boolean;
    normalizeWhitespace: boolean;
}