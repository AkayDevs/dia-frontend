import { BaseStepOutput, BoundingBox, Confidence, PageInfo } from "./shared";


/**
 * Table location
 */
export interface TableLocation{
    bbox: BoundingBox;
    confidence: Confidence;
    table_type?: string;
}

/**
 * Page table detection result
 */
export interface PageTableDetectionResult {
    page_info: PageInfo;
    tables: TableLocation[];
    processing_info: Record<string, any>;
}

/**
 * Table detection result
 */
export interface TableDetectionOutput extends BaseStepOutput {
    results: PageTableDetectionResult[];
}