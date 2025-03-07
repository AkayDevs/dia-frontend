import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AnalysisStatus } from '@/enums/analysis';
import { DashboardStats, DashboardAnalysis, AnalysisTypeStats } from './use-dashboard-stats';
import {
    DocumentIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChartBarIcon,
    BeakerIcon,
    CheckCircleIcon,
    ClockIcon as DurationIcon,
    ArrowPathIcon,
    QuestionMarkCircleIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface StatsOverviewProps {
    stats: DashboardStats;
    isLoading?: boolean;
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

// Mock step accuracy data - to be replaced with real data later
const mockStepAccuracy = {
    'table_analysis': [
        { step: 'Table Detection', accuracy: 98 },
        { step: 'Table Structure', accuracy: 92 },
        { step: 'Table Data', accuracy: 88 }
    ],
    'text_analysis': [
        { step: 'Text Extraction', accuracy: 96 },
        { step: 'Text Processing', accuracy: 91 },
        { step: 'Text Analysis', accuracy: 89 }
    ]
};

export function StatsOverview({ stats, isLoading = false }: StatsOverviewProps) {
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('all');
    const [selectedDocAnalysisType, setSelectedDocAnalysisType] = useState<string>('all');
    const [selectedSuccessType, setSelectedSuccessType] = useState<string>(
        // Set default to table_analysis if available, otherwise use the first available type or empty string
        stats.analysisTypes.find(t => t.code.includes('table_analysis'))?.code ||
        stats.analysisTypes[0]?.code ||
        ''
    );

    const calculatePercentage = (value: number) => {
        if (stats.totalAnalyses === 0) return '0%';
        return `${Math.round((value / stats.totalAnalyses) * 100)}%`;
    };

    const formatDuration = (minutes: number): string => {
        if (minutes < 0) return 'No data';
        if (minutes < 1) return 'Less than a minute';
        if (minutes < 60) return `${Math.round(minutes)} minutes`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = Math.round(minutes % 60);
        return `${hours}h ${remainingMinutes}m`;
    };

    // Get the count of analyzed documents for a specific analysis type
    const getAnalyzedDocumentsForType = (typeCode: string | 'all'): number => {
        if (typeCode === 'all') {
            return stats.analyzedDocuments;
        }

        const analysisType = stats.analysisTypes.find(t => t.code === typeCode);
        return analysisType?.documentCount || 0;
    };

    // Get success rate for a specific analysis type
    const getSuccessRateForType = (typeCode: string | 'all'): number => {
        if (typeCode === 'all') {
            return stats.analysisSuccessRate;
        }

        const analysesOfType = stats.analyses.filter(a => a.analysis_code === typeCode);
        if (analysesOfType.length === 0) return 0;

        const successfulAnalyses = analysesOfType.filter(a => a.status === AnalysisStatus.COMPLETED).length;
        return (successfulAnalyses / analysesOfType.length) * 100;
    };

    // Get mock step accuracy data for a specific analysis type
    const getStepAccuracy = (typeCode: string): { step: string; accuracy: number }[] => {
        if (typeCode === 'all') {
            // Return combined step accuracy for all types
            return Object.values(mockStepAccuracy).flat();
        }

        // Map analysis code to mock data key
        const dataKey = typeCode.includes('table') ? 'table_analysis' : 'text_analysis';
        return mockStepAccuracy[dataKey] || [];
    };

    const calculateTypeSpecificDurations = () => {
        const typeStats = new Map<string, { total: number; count: number; displayName: string }>();

        const completedAnalyses = stats.analyses.filter((a: DashboardAnalysis) =>
            a.status === AnalysisStatus.COMPLETED &&
            a.completed_at &&
            a.created_at
        );

        completedAnalyses.forEach((analysis: DashboardAnalysis) => {
            const startTime = new Date(analysis.started_at || analysis.created_at).getTime();
            const endTime = new Date(analysis.completed_at!).getTime();
            const duration = (endTime - startTime) / (1000 * 60);

            const current = typeStats.get(analysis.analysis_code) || {
                total: 0,
                count: 0,
                displayName: analysis.displayName
            };

            typeStats.set(analysis.analysis_code, {
                total: current.total + duration,
                count: current.count + 1,
                displayName: current.displayName
            });
        });

        return Array.from(typeStats.entries()).map(([code, stats]) => ({
            code,
            displayName: stats.displayName,
            averageDuration: stats.total / stats.count
        }));
    };

    // Get average duration for a specific analysis type
    const getAverageDurationForType = (typeCode: string | 'all'): number => {
        const completedAnalyses = stats.analyses.filter(a =>
            a.status === AnalysisStatus.COMPLETED &&
            a.completed_at &&
            a.started_at &&
            (typeCode === 'all' || a.analysis_code === typeCode)
        );

        if (completedAnalyses.length === 0) return -1;

        const totalDuration = completedAnalyses.reduce((total, analysis) => {
            const startTime = new Date(analysis.started_at || analysis.created_at).getTime();
            const endTime = new Date(analysis.completed_at!).getTime();
            return total + ((endTime - startTime) / (1000 * 60)); // Convert to minutes
        }, 0);

        return totalDuration / completedAnalyses.length;
    };

    // Get min/max durations for a specific analysis type
    const getDurationExtremes = (typeCode: string | 'all') => {
        const completedAnalyses = stats.analyses.filter(a =>
            a.status === AnalysisStatus.COMPLETED &&
            a.completed_at &&
            (typeCode === 'all' || a.analysis_code === typeCode)
        );

        if (completedAnalyses.length === 0) {
            return { min: -1, max: -1 };
        }

        const durations = completedAnalyses.map(a => {
            const startTime = new Date(a.started_at || a.created_at).getTime();
            const endTime = new Date(a.completed_at!).getTime();
            return (endTime - startTime) / (1000 * 60); // Convert to minutes
        });

        return {
            min: Math.min(...durations),
            max: Math.max(...durations)
        };
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
            case 'Analyzed Documents':
                return (
                    <div className="space-y-2">
                        <CardHeader />

                        <div className="mt-2">
                            <p className="text-2xl font-semibold tracking-tight">
                                {getAnalyzedDocumentsForType(selectedDocAnalysisType)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {selectedDocAnalysisType === 'all'
                                    ? 'Documents analyzed with any analysis type'
                                    : `Documents analyzed with ${stats.analysisTypes.find(t => t.code === selectedDocAnalysisType)?.displayName}`}
                            </p>
                        </div>

                        <div className="pt-2 border-t">
                            <Select
                                value={selectedDocAnalysisType}
                                onValueChange={setSelectedDocAnalysisType}
                            >
                                <SelectTrigger className="w-full h-7 text-sm">
                                    <SelectValue placeholder="Select analysis type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Analysis Types</SelectItem>
                                    {stats.analysisTypes.map(type => (
                                        <SelectItem key={type.code} value={type.code}>
                                            {type.displayName} ({type.documentCount})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case 'Success Rate':
                const successRate = getSuccessRateForType(selectedSuccessType);
                const stepAccuracy = getStepAccuracy(selectedSuccessType);

                return (
                    <div className="space-y-2">
                        <CardHeader />

                        <div className="mt-2">
                            <p className="text-2xl font-semibold tracking-tight">
                                {Math.round(successRate)}%
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Success rate for {stats.analysisTypes.find(t => t.code === selectedSuccessType)?.displayName || 'selected analysis'}
                            </p>
                        </div>

                        <div className="pt-2 border-t">
                            <Select
                                value={selectedSuccessType}
                                onValueChange={setSelectedSuccessType}
                            >
                                <SelectTrigger className="w-full h-7 text-sm">
                                    <SelectValue placeholder="Select analysis type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stats.analysisTypes.map(type => (
                                        <SelectItem key={type.code} value={type.code}>
                                            {type.displayName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Step Accuracy</p>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="p-2">
                                        <p className="text-sm">Accuracy of each analysis step based on user corrections</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="space-y-3">
                                {stepAccuracy.length > 0 ? (
                                    stepAccuracy.map((step, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">{step.step}</span>
                                                <span className="font-medium">{step.accuracy}%</span>
                                            </div>
                                            <Progress
                                                value={step.accuracy}
                                                className={cn(
                                                    "h-1.5",
                                                    step.accuracy >= 95 ? "bg-green-100" :
                                                        step.accuracy >= 85 ? "bg-blue-100" :
                                                            step.accuracy >= 75 ? "bg-amber-100" : "bg-red-100"
                                                )}
                                                style={{
                                                    '--progress-foreground': step.accuracy >= 95 ? 'var(--green-600)' :
                                                        step.accuracy >= 85 ? 'var(--blue-600)' :
                                                            step.accuracy >= 75 ? 'var(--amber-600)' : 'var(--red-600)'
                                                } as React.CSSProperties}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground text-center py-2">
                                        No step data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

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
                                    : `Average for ${stats.analysisTypes.find(t => t.code === selectedAnalysisType)?.displayName || selectedAnalysisType}`}
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
                                    {stats.analysisTypes.map(type => (
                                        <SelectItem key={type.code} value={type.code}>
                                            {type.displayName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                <div className="p-1.5 rounded-md bg-muted/50">
                                    <p className="text-xs font-medium text-muted-foreground">Fastest</p>
                                    <p className="text-sm font-medium">
                                        {formatDuration(getDurationExtremes(selectedAnalysisType).min)}
                                    </p>
                                </div>
                                <div className="p-1.5 rounded-md bg-muted/50">
                                    <p className="text-xs font-medium text-muted-foreground">Slowest</p>
                                    <p className="text-sm font-medium">
                                        {formatDuration(getDurationExtremes(selectedAnalysisType).max)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Ongoing Analyses':
                return (
                    <div>
                        <CardHeader />
                        <div className="mt-2">
                            <p className="text-2xl font-semibold tracking-tight">
                                {item.value}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {item.description}
                            </p>
                        </div>
                        {stats.ongoingAnalyses.count > 0 && (
                            <div className="flex items-center gap-2 mt-4 p-2 rounded-md bg-muted/50">
                                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                <p className="text-sm">
                                    {stats.ongoingAnalyses.count === 1
                                        ? '1 analysis in progress'
                                        : `${stats.ongoingAnalyses.count} analyses in progress`}
                                </p>
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div>
                        <CardHeader />
                        <div className="mt-2">
                            <p className="text-2xl font-semibold tracking-tight">
                                {item.value}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {item.description}
                            </p>
                        </div>
                        {item.extraContent}
                    </div>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="p-6">
                            <div className="flex items-start gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                        <Card key={i} className="p-6">
                            <div className="flex items-start gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const statItems: StatItem[] = [
        {
            title: 'Total Documents',
            value: stats.totalDocuments,
            icon: <DocumentIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            description: 'Total documents in the system',
            bgColor: 'bg-blue-50 dark:bg-blue-950',
            borderColor: 'ring-blue-200/50 dark:ring-blue-800/50',
            showTrend: false
        },
        {
            title: 'Analyzed Documents',
            value: stats.analyzedDocuments,
            icon: <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />,
            description: 'Documents that have been successfully analyzed',
            bgColor: 'bg-green-50 dark:bg-green-950',
            borderColor: 'ring-green-200/50 dark:ring-green-800/50',
            showTrend: true,
            trend: {
                direction: 'up',
                value: calculatePercentage(stats.analyzedDocuments),
                label: 'of total'
            }
        },
        {
            title: 'Most Used Analysis',
            value: stats.mostUsedAnalysisType.displayName || 'None',
            icon: <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
            description: stats.mostUsedAnalysisType.documentCount > 0
                ? `Used on ${stats.mostUsedAnalysisType.documentCount} documents`
                : 'No analyses performed yet',
            bgColor: 'bg-purple-50 dark:bg-purple-950',
            borderColor: 'ring-purple-200/50 dark:ring-purple-800/50',
            showTrend: false
        },
        {
            title: 'Ongoing Analyses',
            value: stats.ongoingAnalyses.count,
            icon: <ArrowPathIcon className={cn(
                "w-6 h-6 text-yellow-600 dark:text-yellow-400",
                stats.ongoingAnalyses.count > 0 && "animate-spin"
            )} />,
            description: stats.ongoingAnalyses.count > 0
                ? `${calculatePercentage(stats.ongoingAnalyses.count)} of total analyses`
                : 'No ongoing analyses',
            bgColor: 'bg-yellow-50 dark:bg-yellow-950',
            borderColor: 'ring-yellow-200/50 dark:ring-yellow-800/50',
            showTrend: false
        },
        {
            title: 'Average Duration',
            value: formatDuration(stats.averageAnalysisTime),
            icon: <DurationIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
            description: 'Average time to complete an analysis',
            bgColor: 'bg-amber-50 dark:bg-amber-950',
            borderColor: 'ring-amber-200/50 dark:ring-amber-800/50',
            showTrend: false,
            extraContent: (
                <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">Analysis Type Breakdown:</p>
                    {calculateTypeSpecificDurations().map(({ code, displayName, averageDuration }) => (
                        <div key={code} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                {displayName}:
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
            title: 'Success Rate',
            value: `${Math.round(stats.analysisSuccessRate)}%`,
            icon: <AdjustmentsHorizontalIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
            description: 'Analysis success rate with step-by-step accuracy',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950',
            borderColor: 'ring-emerald-200/50 dark:ring-emerald-800/50',
            showTrend: true,
            trend: {
                direction: stats.analysisSuccessRate >= 95 ? 'up' : 'down',
                value: stats.analysisSuccessRate >= 95 ? 'High' : 'Needs improvement',
                label: 'success rate'
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
                            "p-6 transition-all duration-200",
                            "hover:shadow-md"
                        )}
                    >
                        {renderCardContent(item)}
                    </Card>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {statItems.slice(4, 6).map((item) => (
                    <Card
                        key={item.title}
                        className={cn(
                            "p-6 transition-all duration-200",
                            "hover:shadow-md"
                        )}
                    >
                        {renderCardContent(item)}
                    </Card>
                ))}
            </div>
        </div>
    );
} 