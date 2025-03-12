import { useState } from 'react';
import { BarChart4, LayoutDashboard, LineChart } from 'lucide-react';
import { AnalysisMetricsOverview } from './AnalysisMetricsOverview';
import { AnalysisAlgorithmAccuracy } from './AnalysisAlgorithmAccuracy';
import { AnalysisRunWithResults, AnalysisRunWithResultsInfo } from '@/types/analysis/base';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AnalysisDefinitionInfo } from '@/types/analysis/configs';

interface AnalysisMetricsContainerProps {
    documents: any[];
    analysesArray: (AnalysisRunWithResults | AnalysisRunWithResultsInfo)[];
    analysisDefinitions: AnalysisDefinitionInfo[];
    getAlgorithmAccuracyData: (analysisTypeId: string | null) => any[];
    isLoading?: boolean;
}

export function AnalysisMetricsContainer({
    documents,
    analysesArray,
    analysisDefinitions,
    getAlgorithmAccuracyData,
    isLoading = false,
}: AnalysisMetricsContainerProps) {
    const [activeMetricView, setActiveMetricView] = useState<'overview' | 'accuracy'>('overview');
    const [selectedMetricAnalysisType, setSelectedMetricAnalysisType] = useState<string | null>(null);

    // Render skeleton metrics for loading state
    const renderSkeletonMetrics = () => {
        return (
            <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-3 border-t">
                    <div className="flex gap-3">
                        {[...Array(3)].map((_, index) => (
                            <Skeleton key={index} className="h-4 w-24" />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="mt-6 border rounded-lg bg-card/50 shadow-sm">
            <div className="flex items-center justify-between p-3 border-b bg-muted/20">
                <div className="flex items-center">
                    <BarChart4 className="h-4 w-4 text-primary/70 mr-2" />
                    <h3 className="text-sm font-medium text-primary/90">Analytics Dashboard</h3>
                </div>

                <div className="flex items-center bg-background/80 rounded-md p-0.5 border border-border/40">
                    <button
                        className={cn(
                            "px-3 py-1 text-xs rounded-sm transition-all duration-200 flex items-center",
                            activeMetricView === 'overview'
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        )}
                        onClick={() => setActiveMetricView('overview')}
                        disabled={isLoading}
                    >
                        <LayoutDashboard className="h-3 w-3 mr-1.5" />
                        Overview
                    </button>
                    <button
                        className={cn(
                            "px-3 py-1 text-xs rounded-sm transition-all duration-200 flex items-center",
                            activeMetricView === 'accuracy'
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        )}
                        onClick={() => setActiveMetricView('accuracy')}
                        disabled={isLoading}
                    >
                        <LineChart className="h-3 w-3 mr-1.5" />
                        Algorithm Accuracy
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-b from-background/50 to-background">
                {isLoading ? (
                    renderSkeletonMetrics()
                ) : activeMetricView === 'overview' ? (
                    <AnalysisMetricsOverview
                        documents={documents}
                        analysesArray={analysesArray}
                        analysisDefinitions={analysisDefinitions}
                    />
                ) : (
                    <AnalysisAlgorithmAccuracy
                        analysisDefinitions={analysisDefinitions}
                        selectedMetricAnalysisType={selectedMetricAnalysisType}
                        setSelectedMetricAnalysisType={setSelectedMetricAnalysisType}
                        getAlgorithmAccuracyData={getAlgorithmAccuracyData}
                    />
                )}
            </div>
        </div>
    );
} 