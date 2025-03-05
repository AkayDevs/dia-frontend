// Export registry functions
export * from './registry';

// Export specific analysis constants
export * from './types/table';
export * from './types/text';

// Common analysis constants
export const ANALYSIS_STATUS_LABELS = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled'
};

export const ANALYSIS_STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
};

export const ANALYSIS_MODE_LABELS = {
    automatic: 'Automatic',
    step_by_step: 'Step by Step'
};

export const ANALYSIS_TYPE_LABELS = {
    table_detection: 'Table Detection',
    text_extraction: 'Text Extraction'
};

export const ANALYSIS_TYPE_DESCRIPTIONS = {
    table_detection: 'Detect and extract data from tables in documents',
    text_extraction: 'Extract and analyze text content from documents'
};

export const ANALYSIS_TYPE_ICONS = {
    table_detection: 'TableCellsIcon',
    text_extraction: 'DocumentTextIcon'
}; 