import { Loader2, ClockIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

// Export registry functions
export * from './registry';

// Export base analysis definition
export * from './definitions/base-analysis';

// Export specific analysis constants
export * from './definitions/table-analysis';
export * from './definitions/text-analysis';

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

// export const ANALYSIS_STATUS_ICONS = {
//     pending: <Loader2 className="h-4 w-4 animate-spin" />,
//     in_progress: <ClockIcon className="h-4 w-4 animate-spin" />,
//     completed: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
//     failed: <XCircleIcon className="h-4 w-4 text-red-500" />,
//     cancelled: <XCircleIcon className="h-4 w-4 text-red-500" />
// };

export const ANALYSIS_MODE_LABELS = {
    automatic: 'Automatic',
    step_by_step: 'Step by Step'
};