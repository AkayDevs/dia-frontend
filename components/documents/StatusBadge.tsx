import { AnalysisStatus } from '@/enums/analysis';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
    status: AnalysisStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const statusConfig: Record<AnalysisStatus, { className: string; label: string }> = {
        [AnalysisStatus.PENDING]: {
            className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            label: 'Ready for Analysis'
        },
        [AnalysisStatus.IN_PROGRESS]: {
            className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            label: 'Processing'
        },
        [AnalysisStatus.COMPLETED]: {
            className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            label: 'Analysis Complete'
        },
        [AnalysisStatus.FAILED]: {
            className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            label: 'Analysis Failed'
        },
        [AnalysisStatus.CANCELLED]: {
            className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
            label: 'Analysis Cancelled'
        }
    };

    const config = statusConfig[status] || statusConfig[AnalysisStatus.PENDING];

    return (
        <Badge variant="secondary" className={config.className}>
            {config.label}
        </Badge>
    );
}; 