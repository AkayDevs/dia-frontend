import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AnalysisStatus } from '@/enums/analysis';
import { DashboardStats, DashboardAnalysis } from './use-dashboard-stats';
import {
    DocumentIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChartBarIcon,
    BeakerIcon,
    CheckCircleIcon,
    ClockIcon as DurationIcon,
    ArrowPathIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

interface StatsOverviewProps {
    stats: DashboardStats;
}

interface StatItem {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description: string;
    color?: string;
    bgColor?: string;
    borderColor?: string;
    showTrend?: boolean;
    trend?: {
        direction: 'up' | 'down' | 'neutral';
        value: string;
        label: string;
    };
    extraContent?: React.ReactNode;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('all');

    const calculatePercentage = (value: number) => {
        if (stats.totalAnalyses === 0) return '0%';
        return `${Math.round((value / stats.totalAnalyses) * 100)}%`;
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

    const calculateTypeSpecificDurations = () => {
        const typeStats = new Map<string, { total: number; count: number }>();

        const completedAnalyses = stats.analyses.filter((a: DashboardAnalysis) =>
            a.status === 'completed' &&
            a.completed_at &&
            a.created_at
        );

        completedAnalyses.forEach((analysis: DashboardAnalysis) => {
            const duration = (new Date(analysis.completed_at!).getTime() - new Date(analysis.created_at).getTime()) / (1000 * 60);
            const current = typeStats.get(analysis.type) || { total: 0, count: 0 };
            typeStats.set(analysis.type, {
                total: current.total + duration,
                count: current.count + 1
            });
        });

        return Array.from(typeStats.entries()).map(([type, stats]) => ({
            type,
            averageDuration: stats.total / stats.count
        }));
    };

    const getAverageDurationForType = (type: string | 'all'): number => {
        const completedAnalyses = stats.analyses.filter(a =>
            a.status === 'completed' &&
            a.completed_at &&
            (type === 'all' || a.type === type)
        );

        if (completedAnalyses.length === 0) return -1;

        const totalDuration = completedAnalyses.reduce((total, analysis) => {
            const duration = (new Date(analysis.completed_at!).getTime() - new Date(analysis.created_at).getTime()) / (1000 * 60);
            return total + duration;
        }, 0);

        return totalDuration / completedAnalyses.length;
    };

    const getAnalysisTypes = (): string[] => {
        return Array.from(new Set(stats.analyses.map(a => a.type)));
    };

    const renderCardContent = (item: StatItem) => {
        const CardHeader = () => (
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "p-2 rounded-lg",
                        item.bgColor,
                        "ring-1 ring-inset",
                        item.borderColor
                    )}>
                        {item.icon}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                {item.title}
                            </h3>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="p-2">
                                    <p className="text-sm">{item.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        {item.showTrend && item.trend && (
                            <div className={cn(
                                "flex items-center gap-1 text-xs",
                                item.trend.direction === 'up' ? 'text-green-600 dark:text-green-400' :
                                    item.trend.direction === 'down' ? 'text-red-600 dark:text-red-400' :
                                        'text-muted-foreground'
                            )}>
                                {item.trend.direction === 'up' ? <ArrowUpIcon className="w-3 h-3" /> :
                                    item.trend.direction === 'down' ? <ArrowDownIcon className="w-3 h-3" /> : null}
                                <span>{item.trend.value}</span>
                                <span className="text-muted-foreground/80">{item.trend.label}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );

        switch (item.title) {
            case 'Average Duration':
                return (
                    <div className="space-y-2">
                        <CardHeader />

                        <div className="mt-2">
                            <p className="text-2xl font-semibold tracking-tight">
                                {formatDuration(getAverageDurationForType(selectedAnalysisType))}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {selectedAnalysisType === 'all'
                                    ? 'Average across all analysis types'
                                    : `Average for ${formatAnalysisType(selectedAnalysisType)}`}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Select
                                value={selectedAnalysisType}
                                onValueChange={setSelectedAnalysisType}
                            >
                                <SelectTrigger className="w-full h-7 text-sm">
                                    <SelectValue placeholder="Select analysis type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {getAnalysisTypes().map(type => (
                                        <SelectItem key={type} value={type}>
                                            {formatAnalysisType(type)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                <div className="p-1.5 rounded-md bg-muted/50">
                                    <p className="text-xs font-medium text-muted-foreground">Fastest</p>
                                    <p className="text-sm font-medium">
                                        {formatDuration(Math.min(...stats.analyses
                                            .filter(a => a.status === 'completed' && a.completed_at &&
                                                (selectedAnalysisType === 'all' || a.type === selectedAnalysisType))
                                            .map(a => (new Date(a.completed_at!).getTime() - new Date(a.created_at).getTime()) / (1000 * 60))
                                        ))}
                                    </p>
                                </div>
                                <div className="p-1.5 rounded-md bg-muted/50">
                                    <p className="text-xs font-medium text-muted-foreground">Slowest</p>
                                    <p className="text-sm font-medium">
                                        {formatDuration(Math.max(...stats.analyses
                                            .filter(a => a.status === 'completed' && a.completed_at &&
                                                (selectedAnalysisType === 'all' || a.type === selectedAnalysisType))
                                            .map(a => (new Date(a.completed_at!).getTime() - new Date(a.created_at).getTime()) / (1000 * 60))
                                        ))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Ongoing Analyses':
                return (
                    <div className="h-full justify-between flex flex-col">
                        <CardHeader />

                        <div>
                            <p className="text-2xl font-semibold tracking-tight">
                                {item.value}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {item.description}
                            </p>
                        </div>

                        {stats.ongoingAnalyses.count > 0 && (
                            <div className="space-y-2 pt-2 border-t">
                                <p className="text-sm font-medium">Current Analyses:</p>
                                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2">
                                    {stats.ongoingAnalyses.items.map((analysis, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                                <div className="truncate">
                                                    <span className="font-medium">{analysis.documentName}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatAnalysisType(analysis.type)}
                                                </span>
                                                <span className="text-xs text-muted-foreground/80">
                                                    {new Date(analysis.startedAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {stats.ongoingAnalyses.count === 0 && (
                            <div className="flex items-center justify-center p-4 rounded-md bg-muted/30">
                                <p className="text-sm text-muted-foreground">No ongoing analyses at the moment</p>
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="space-y-3">
                        <CardHeader />

                        <div>
                            <p className="text-2xl font-semibold tracking-tight">
                                {item.value}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {item.description}
                            </p>
                        </div>
                    </div>
                );
        }
    };

    const statItems: StatItem[] = [
        {
            title: 'Total Documents',
            value: stats.totalDocuments,
            icon: <DocumentIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            description: 'Total documents in the system',
            bgColor: 'bg-blue-50 dark:bg-blue-950',
            borderColor: 'border-blue-100 dark:border-blue-900',
            showTrend: false
        },
        {
            title: 'Total Analyses',
            value: stats.totalAnalyses,
            icon: <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
            description: stats.totalAnalyses > 0
                ? `${Math.round(stats.totalAnalyses / stats.totalDocuments * 100)}% analysis ratio`
                : 'No analyses yet',
            bgColor: 'bg-purple-50 dark:bg-purple-950',
            borderColor: 'border-purple-100 dark:border-purple-900',
            showTrend: false
        },
        {
            title: 'Success Rate',
            value: `${Math.round(stats.analysisSuccessRate)}%`,
            icon: <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />,
            description: `${stats.totalAnalyses} total analyses performed`,
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
            icon: <BeakerIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
            description: stats.mostUsedAnalysisType.count > 0
                ? `Used ${stats.mostUsedAnalysisType.count} times`
                : 'No analyses performed yet',
            bgColor: 'bg-indigo-50 dark:bg-indigo-950',
            borderColor: 'border-indigo-100 dark:border-indigo-900',
            showTrend: false
        },
        {
            title: 'Average Duration',
            value: stats.averageAnalysisTime === -1 ? 'N/A' : formatDuration(stats.averageAnalysisTime),
            icon: <DurationIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
            description: stats.averageAnalysisTime === -1
                ? 'No completed analyses yet'
                : 'Average time per analysis',
            bgColor: 'bg-amber-50 dark:bg-amber-950',
            borderColor: 'border-amber-100 dark:border-amber-900',
            showTrend: stats.averageAnalysisTime !== -1,
            trend: stats.averageAnalysisTime !== -1 ? {
                direction: stats.averageAnalysisTime < 5 ? 'up' : 'down',
                value: '10%',
                label: 'vs. last month'
            } : undefined,
            extraContent: (
                <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">Analysis Type Breakdown:</p>
                    {calculateTypeSpecificDurations().map(({ type, averageDuration }) => (
                        <div key={type} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                {formatAnalysisType(type)}:
                            </span>
                            <span className="font-medium">
                                {formatDuration(averageDuration)}
                            </span>
                        </div>
                    ))}
                </div>
            )
        },
        {
            title: 'Ongoing Analyses',
            value: stats.ongoingAnalyses.count,
            icon: <ArrowPathIcon className={cn(
                "w-6 h-6 text-yellow-500",
                stats.ongoingAnalyses.count > 0 && "animate-spin"
            )} />,
            description: stats.ongoingAnalyses.count > 0
                ? `${calculatePercentage(stats.ongoingAnalyses.count)} of total analyses`
                : 'No ongoing analyses',
            bgColor: 'bg-yellow-50 dark:bg-yellow-950',
            borderColor: 'border-yellow-100 dark:border-yellow-900',
            showTrend: true,
            trend: {
                direction: 'neutral',
                value: '0%',
                label: 'Real-time updates'
            }
        }
    ];

    return (
        <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statItems.slice(0, 4).map((item) => (
                    <Card
                        key={item.title}
                        className={cn(
                            "p-4 border transition-all duration-200",
                            item.borderColor,
                            "hover:shadow-md hover:border-primary/20"
                        )}
                    >
                        {renderCardContent(item)}
                    </Card>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {statItems.slice(4).map((item) => (
                    <Card
                        key={item.title}
                        className={cn(
                            "p-4 border transition-all duration-200",
                            item.borderColor,
                            "hover:shadow-md hover:border-primary/20"
                        )}
                    >
                        {renderCardContent(item)}
                    </Card>
                ))}
            </div>
        </div>
    );
} 