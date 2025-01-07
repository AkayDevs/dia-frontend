import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
    DocumentIcon,
    DocumentCheckIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
    totalDocuments: number;
    analyzedDocuments: number;
    pendingAnalyses: number;
    failedAnalyses: number;
}

interface StatsOverviewProps {
    stats: DashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    const calculatePercentage = (value: number): string => {
        if (stats.totalDocuments === 0) return '0%';
        return `${Math.round((value / stats.totalDocuments) * 100)}%`;
    };

    const statItems = [
        {
            title: 'Total Documents',
            value: stats.totalDocuments,
            icon: DocumentIcon,
            description: 'Total documents uploaded',
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-950',
            borderColor: 'border-blue-100 dark:border-blue-900',
            trend: {
                direction: 'up',
                value: '12%',
                label: 'vs. last month'
            }
        },
        {
            title: 'Analyzed Documents',
            value: stats.analyzedDocuments,
            icon: DocumentCheckIcon,
            description: `${calculatePercentage(stats.analyzedDocuments)} of total documents`,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-950',
            borderColor: 'border-green-100 dark:border-green-900',
            trend: {
                direction: 'up',
                value: '8%',
                label: 'vs. last month'
            }
        },
        {
            title: 'Pending Analysis',
            value: stats.pendingAnalyses,
            icon: ClockIcon,
            description: `${calculatePercentage(stats.pendingAnalyses)} of total documents`,
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-50 dark:bg-yellow-950',
            borderColor: 'border-yellow-100 dark:border-yellow-900',
            trend: {
                direction: 'down',
                value: '5%',
                label: 'vs. last month'
            }
        },
        {
            title: 'Failed Analysis',
            value: stats.failedAnalyses,
            icon: ExclamationTriangleIcon,
            description: `${calculatePercentage(stats.failedAnalyses)} of total documents`,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-950',
            borderColor: 'border-red-100 dark:border-red-900',
            trend: {
                direction: 'down',
                value: '3%',
                label: 'vs. last month'
            }
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <p className={cn(
                                            "text-3xl font-bold tracking-tight",
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
                                <div className="text-sm">
                                    <span className={cn(
                                        "font-medium",
                                        item.trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    )}>
                                        {item.trend.direction === 'up' ? '↑' : '↓'} {item.trend.value}
                                    </span>
                                    <span className="text-muted-foreground"> {item.trend.label}</span>
                                </div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </Card>
            ))}
        </div>
    );
} 