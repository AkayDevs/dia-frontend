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
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    in_progress: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    failed: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    cancelled: 'bg-slate-100 text-slate-800 dark:bg-slate-800/40 dark:text-slate-300'
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