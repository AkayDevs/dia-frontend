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
 * Validation utilities for shared types
 */
export const ValidationUtils = {
    /**
     * Validate a bounding box
     * @returns true if valid, throws error if invalid
     */
    validateBoundingBox: (bbox: BoundingBox): boolean => {
        if (bbox.x1 < 0) throw new Error("x1 must be greater than or equal to 0");
        if (bbox.y1 < 0) throw new Error("y1 must be greater than or equal to 0");
        if (bbox.x2 < bbox.x1) throw new Error("x2 must be greater than or equal to x1");
        if (bbox.y2 < bbox.y1) throw new Error("y2 must be greater than or equal to y1");
        return true;
    },

    /**
     * Validate a confidence score
     * @returns true if valid, throws error if invalid
     */
    validateConfidence: (confidence: Confidence): boolean => {
        if (confidence.score < 0 || confidence.score > 1) {
            throw new Error("Confidence score must be between 0 and 1");
        }
        if (!confidence.method) {
            throw new Error("Confidence method is required");
        }
        return true;
    },

    /**
     * Validate page information
     * @returns true if valid, throws error if invalid
     */
    validatePageInfo: (pageInfo: PageInfo): boolean => {
        if (pageInfo.page_number < 1) {
            throw new Error("Page number must be greater than or equal to 1");
        }
        if (pageInfo.width <= 0) {
            throw new Error("Page width must be greater than 0");
        }
        if (pageInfo.height <= 0) {
            throw new Error("Page height must be greater than 0");
        }
        return true;
    }
};

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
    },

    /**
     * Calculate area of a bounding box in pixels
     */
    getArea: (bbox: BoundingBox): number => {
        return (bbox.x2 - bbox.x1) * (bbox.y2 - bbox.y1);
    },

    /**
     * Check if a point is inside a bounding box
     */
    containsPoint: (bbox: BoundingBox, point: { x: number; y: number }): boolean => {
        return point.x >= bbox.x1 && point.x <= bbox.x2 &&
            point.y >= bbox.y1 && point.y <= bbox.y2;
    }
};
