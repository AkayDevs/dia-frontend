import { AnalysisStatus } from '@/enums/analysis';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { AnalysisRunWithResults } from '@/types/analysis/base';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface StatusBadgeProps {
    status: AnalysisStatus;
    analyses?: AnalysisRunWithResults[];
}

export const StatusBadge = ({ status, analyses = [] }: StatusBadgeProps) => {
    // Add debug log to see the structure of the analyses data
    console.log('Analysis data for tooltip:', analyses);

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

    // Count completed analyses by type
    const completedAnalyses = analyses.filter(a => a.status === AnalysisStatus.COMPLETED);
    const hasCompletedAnalyses = completedAnalyses.length > 0;

    // Group analyses by type for the tooltip
    const analysisByType = analyses.reduce((acc, analysis) => {
        // Get a meaningful name for the analysis type
        const type = analysis.definition?.name ||
            analysis.definition?.code ||
            analysis.definition_id ||
            "Unknown Analysis";

        if (!acc[type]) {
            acc[type] = { completed: 0, failed: 0, inProgress: 0, pending: 0, total: 0 };
        }

        acc[type].total++;

        if (analysis.status === AnalysisStatus.COMPLETED) {
            acc[type].completed++;
        } else if (analysis.status === AnalysisStatus.FAILED) {
            acc[type].failed++;
        } else if (analysis.status === AnalysisStatus.IN_PROGRESS) {
            acc[type].inProgress++;
        } else if (analysis.status === AnalysisStatus.PENDING) {
            acc[type].pending++;
        }

        return acc;
    }, {} as Record<string, { completed: number; failed: number; inProgress: number; pending: number; total: number }>);

    return (
        <div className="flex items-center gap-1">
            <Badge variant="secondary" className={config.className}>
                {config.label}
            </Badge>

            {analyses.length > 0 ? (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="cursor-help">
                                <InformationCircleIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="w-64 p-0">
                            <div className="p-2 text-xs">
                                <p className="font-semibold mb-2">Analysis Details</p>
                                {Object.keys(analysisByType).length > 0 ? (
                                    <div className="space-y-2">
                                        {Object.entries(analysisByType).map(([type, stats]) => (
                                            <div key={type} className="space-y-1">
                                                <p className="font-medium">{type}</p>
                                                <div className="flex items-center gap-1">
                                                    {stats.completed > 0 && (
                                                        <div
                                                            className="h-2 bg-green-500 rounded-l-full"
                                                            style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                                                        />
                                                    )}
                                                    {stats.inProgress > 0 && (
                                                        <div
                                                            className="h-2 bg-yellow-500"
                                                            style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                                                        />
                                                    )}
                                                    {stats.failed > 0 && (
                                                        <div
                                                            className="h-2 bg-red-500"
                                                            style={{ width: `${(stats.failed / stats.total) * 100}%` }}
                                                        />
                                                    )}
                                                    {stats.pending > 0 && (
                                                        <div
                                                            className="h-2 bg-blue-500 rounded-r-full"
                                                            style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-x-2 text-[10px] text-muted-foreground">
                                                    {stats.completed > 0 && <span>{stats.completed} completed</span>}
                                                    {stats.failed > 0 && <span>{stats.failed} failed</span>}
                                                    {stats.inProgress > 0 && <span>{stats.inProgress} in progress</span>}
                                                    {stats.pending > 0 && <span>{stats.pending} pending</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No analysis data available</p>
                                )}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : null}

            {hasCompletedAnalyses && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                    {completedAnalyses.length}
                </Badge>
            )}
        </div>
    );
}; 