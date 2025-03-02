import { BoundingBox, Confidence, PageInfo } from './shared';

/**
 * Standard table location information
 */
export interface TableLocation {
    bbox: BoundingBox;
    confidence: Confidence;
    table_type?: string;
}

/**
 * Results for a single page of table detection
 */
export interface PageTableDetectionResult {
    /** Information about the processed page */
    page_info: PageInfo;
    /** List of detected tables with their locations */
    tables: TableLocation[];
    /** Additional processing information for this page */
    processing_info: Record<string, any>;
}

/**
 * Schema for table detection results across all pages
 */
export interface TableDetectionResult {
    /** Schema information */
    schema_info: {
        name: string;
        description: string;
        version: string;
    };
    /** List of table detection results for each page */
    results: PageTableDetectionResult[];
    /** Total number of pages processed */
    total_pages_processed: number;
    /** Total number of tables found across all pages */
    total_tables_found: number;
    /** Additional metadata about the detection process */
    metadata: Record<string, any>;
}

/**
 * Helper functions for working with table detection results
 */
export const TableDetectionUtils = {
    /**
     * Get total number of tables in a page result
     */
    getPageTableCount: (pageResult: PageTableDetectionResult): number => {
        return pageResult.tables.length;
    },

    /**
     * Get tables for a specific page number
     */
    getTablesByPageNumber: (result: TableDetectionResult, pageNumber: number): TableLocation[] => {
        const pageResult = result.results.find(p => p.page_info.page_number === pageNumber);
        return pageResult?.tables || [];
    },

    /**
     * Check if a page has any tables
     */
    hasTablesOnPage: (result: TableDetectionResult, pageNumber: number): boolean => {
        return TableDetectionUtils.getTablesByPageNumber(result, pageNumber).length > 0;
    },

    /**
     * Get confidence statistics for all tables
     */
    getConfidenceStats: (result: TableDetectionResult) => {
        const scores = result.results
            .flatMap(page => page.tables)
            .map(table => table.confidence.score);

        if (scores.length === 0) return null;

        return {
            min: Math.min(...scores),
            max: Math.max(...scores),
            average: scores.reduce((a, b) => a + b, 0) / scores.length
        };
    }
};
