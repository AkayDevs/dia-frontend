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
    total_tables_processed: number;
    metadata: Record<string, any>;
}