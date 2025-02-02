/**
 * Standard bounding box representation in pixels.
 */
export interface BoundingBox {
    /** Left coordinate in pixels */
    x1: number;
    /** Top coordinate in pixels */
    y1: number;
    /** Right coordinate in pixels */
    x2: number;
    /** Bottom coordinate in pixels */
    y2: number;
}

/**
 * Standard confidence score representation.
 */
export interface Confidence {
    /** Confidence score between 0 and 1 */
    score: number;
    /** Method used to calculate confidence */
    method: string;
}

/**
 * Standard page information.
 */
export interface PageInfo {
    /** Page number (1-indexed) */
    page_number: number;
    /** Page width in pixels */
    width: number;
    /** Page height in pixels */
    height: number;
}

/**
 * Helper functions for working with bounding boxes
 */
export const BoundingBoxUtils = {
    /**
     * Convert a bounding box from x1,y1,x2,y2 format to x,y,width,height format
     */
    toDisplayFormat: (bbox: BoundingBox) => {
        return {
            x: bbox.x1,
            y: bbox.y1,
            width: bbox.x2 - bbox.x1,
            height: bbox.y2 - bbox.y1
        };
    },

    /**
     * Convert a bounding box from x,y,width,height format to x1,y1,x2,y2 format
     */
    fromDisplayFormat: (display: { x: number; y: number; width: number; height: number }): BoundingBox => {
        return {
            x1: display.x,
            y1: display.y,
            x2: display.x + display.width,
            y2: display.y + display.height
        };
    },

    /**
     * Convert pixel coordinates to percentages based on page dimensions
     */
    toPercentages: (bbox: BoundingBox, pageInfo: PageInfo) => {
        return {
            x1: (bbox.x1 / pageInfo.width) * 100,
            y1: (bbox.y1 / pageInfo.height) * 100,
            x2: (bbox.x2 / pageInfo.width) * 100,
            y2: (bbox.y2 / pageInfo.height) * 100
        };
    },

    /**
     * Convert percentage coordinates to pixels based on page dimensions
     */
    toPixels: (bbox: BoundingBox, pageInfo: PageInfo) => {
        return {
            x1: Math.round((bbox.x1 * pageInfo.width) / 100),
            y1: Math.round((bbox.y1 * pageInfo.height) / 100),
            x2: Math.round((bbox.x2 * pageInfo.width) / 100),
            y2: Math.round((bbox.y2 * pageInfo.height) / 100)
        };
    }
};
