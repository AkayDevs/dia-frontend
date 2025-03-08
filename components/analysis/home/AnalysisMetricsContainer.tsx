import { useState } from 'react';
import { BarChart4, LayoutDashboard, LineChart } from 'lucide-react';
import { AnalysisMetricsOverview } from './AnalysisMetricsOverview';
import { AnalysisAlgorithmAccuracy } from './AnalysisAlgorithmAccuracy';
import { AnalysisRunWithResults, AnalysisRunWithResultsInfo } from '@/types/analysis/base';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalysisMetricsContainerProps {
    documents: any[];
    analysesArray: (AnalysisRunWithResults | AnalysisRunWithResultsInfo)[];
    analysisDefinitions: any[];
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
        <div className="mt-6 border rounded-lg bg-card/50">
            <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center">
                    <BarChart4 className="h-5 w-5 text-muted-foreground mr-2" />
                    <h3 className="text-sm font-medium">Metrics</h3>
                </div>

                <div className="flex items-center bg-muted/50 rounded-md p-0.5">
                    <button
                        className={`px-3 py-1 text-xs rounded-sm transition-colors ${activeMetricView === 'overview'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        onClick={() => setActiveMetricView('overview')}
                        disabled={isLoading}
                    >
                        <span className="flex items-center">
                            <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                            Overview
                        </span>
                    </button>
                    <button
                        className={`px-3 py-1 text-xs rounded-sm transition-colors ${activeMetricView === 'accuracy'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        onClick={() => setActiveMetricView('accuracy')}
                        disabled={isLoading}
                    >
                        <span className="flex items-center">
                            <LineChart className="h-3.5 w-3.5 mr-1.5" />
                            Algorithm Accuracy
                        </span>
                    </button>
                </div>
            </div>

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
    );
} 