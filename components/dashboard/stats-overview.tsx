import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
    DocumentIcon,
    DocumentCheckIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChartBarIcon,
    BeakerIcon,
    CheckCircleIcon,
    ClockIcon as DurationIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
    // Document stats
    totalDocuments: number;
    analyzedDocuments: number;
    pendingAnalyses: number;
    failedAnalyses: number;

    // Analysis stats
    totalAnalyses: number;
    analysisSuccessRate: number;
    mostUsedAnalysisType: {
        type: string;
        count: number;
    };
    averageAnalysisTime: number;
}

interface StatsOverviewProps {
    stats: DashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    const calculatePercentage = (value: number): string => {
        if (stats.totalDocuments === 0) return '0%';
        return `${Math.round((value / stats.totalDocuments) * 100)}%`;
    };

    const formatDuration = (minutes: number): string => {
        if (minutes < 1) return 'Less than a minute';
        if (minutes < 60) return `${Math.round(minutes)} minutes`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = Math.round(minutes % 60);
        return `${hours}h ${remainingMinutes}m`;
    };

    const formatAnalysisType = (type: string): string => {
        return type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const statItems = [
        // Document Statistics
        {
            title: 'Total Documents',
            value: stats.totalDocuments,
            icon: DocumentIcon,
            description: 'Total documents in the system',
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-950',
            borderColor: 'border-blue-100 dark:border-blue-900',
            showTrend: false
        },
        {
            title: 'Total Analyses',
            value: stats.totalAnalyses,
            icon: ChartBarIcon,
            description: stats.totalAnalyses > 0
                ? `${Math.round(stats.totalAnalyses / stats.totalDocuments * 100)}% analysis ratio`
                : 'No analyses yet',
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-50 dark:bg-purple-950',
            borderColor: 'border-purple-100 dark:border-purple-900',
            showTrend: false
        },
        {
            title: 'Success Rate',
            value: `${Math.round(stats.analysisSuccessRate)}%`,
            icon: CheckCircleIcon,
            description: `${stats.totalAnalyses} total analyses performed`,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-950',
            borderColor: 'border-green-100 dark:border-green-900',
            showTrend: true,
            trend: {
                direction: stats.analysisSuccessRate >= 95 ? 'up' : 'down',
                value: '3%',
                label: 'vs. last month'
            }
        },
        {
            title: 'Most Used Analysis',
            value: stats.mostUsedAnalysisType.type ? formatAnalysisType(stats.mostUsedAnalysisType.type) : 'None',
            icon: BeakerIcon,
            description: stats.mostUsedAnalysisType.count > 0
                ? `Used ${stats.mostUsedAnalysisType.count} times`
                : 'No analyses performed yet',
            color: 'text-indigo-600 dark:text-indigo-400',
            bgColor: 'bg-indigo-50 dark:bg-indigo-950',
            borderColor: 'border-indigo-100 dark:border-indigo-900',
            showTrend: false
        },
        {
            title: 'Average Duration',
            value: stats.averageAnalysisTime === -1 ? 'N/A' : formatDuration(stats.averageAnalysisTime),
            icon: DurationIcon,
            description: stats.averageAnalysisTime === -1
                ? 'No completed analyses yet'
                : 'Average time per analysis',
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-50 dark:bg-amber-950',
            borderColor: 'border-amber-100 dark:border-amber-900',
            showTrend: stats.averageAnalysisTime !== -1,
            trend: stats.averageAnalysisTime !== -1 ? {
                direction: stats.averageAnalysisTime < 5 ? 'up' : 'down',
                value: '10%',
                label: 'vs. last month'
            } : undefined
        },
        {
            title: 'Pending Analyses',
            value: stats.pendingAnalyses,
            icon: ClockIcon,
            description: stats.pendingAnalyses > 0
                ? `${calculatePercentage(stats.pendingAnalyses)} of total documents`
                : 'No pending analyses',
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-50 dark:bg-yellow-950',
            borderColor: 'border-yellow-100 dark:border-yellow-900',
            showTrend: false
        },
        {
            title: 'Failed Analyses',
            value: stats.failedAnalyses,
            icon: ExclamationTriangleIcon,
            description: stats.failedAnalyses > 0
                ? `${calculatePercentage(stats.failedAnalyses)} of total documents`
                : 'No failed analyses',
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-950',
            borderColor: 'border-red-100 dark:border-red-900',
            showTrend: false
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {statItems.map((item) => (
                <Card
                    key={item.title}
                    className={cn(
                        "p-6 border-2 transition-all duration-200",
                        item.borderColor,
                        "hover:shadow-lg hover:scale-[1.02]"
                    )}
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="space-y-4 cursor-help">
                                <div className="flex items-center justify-between">
                                    <div className={cn(
                                        "p-3 rounded-xl",
                                        item.bgColor,
                                        "ring-1 ring-inset",
                                        item.borderColor
                                    )}>
                                        <item.icon className={cn("w-6 h-6", item.color)} />
                                    </div>
                                    {item.showTrend && item.trend && (
                                        <div className={cn(
                                            "flex items-center gap-1 text-sm",
                                            item.trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        )}>
                                            {item.trend.direction === 'up' ? (
                                                <ArrowUpIcon className="w-4 h-4" />
                                            ) : (
                                                <ArrowDownIcon className="w-4 h-4" />
                                            )}
                                            <span>{item.trend.value}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <p className={cn(
                                            "text-2xl font-bold tracking-tight",
                                            item.color
                                        )}>
                                            {item.value}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="p-4 max-w-xs">
                            <div className="space-y-2">
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    Current value: {item.value} ({item.description})
                                </p>
                                {item.showTrend && item.trend && (
                                    <div className="text-sm">
                                        <span className={cn(
                                            "font-medium",
                                            item.trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        )}>
                                            {item.trend.direction === 'up' ? '↑' : '↓'} {item.trend.value}
                                        </span>
                                        <span className="text-muted-foreground"> {item.trend.label}</span>
                                    </div>
                                )}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </Card>
            ))}
        </div>
    );
} 