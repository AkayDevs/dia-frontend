import { BoundingBox, Confidence, PageInfo, BaseStepOutput } from "./shared";

/**
 * Cell content
 */
export interface CellContent {
    text: string;
    confidence: Confidence;
    data_type: string;
    normalized_value: any;
}

/**
 * Table data
 */
export interface TableData {
    bbox: BoundingBox;
    cells: CellContent[][];
    confidence: Confidence;
}

/**
 * Page table data result
 */
export interface PageTableDataResult {
    page_info: PageInfo;
    tables: TableData[];
    processing_info: Record<string, any>;
}

/**
 * Table data output
 */
export interface TableDataOutput extends BaseStepOutput {
    results: PageTableDataResult[];
}
