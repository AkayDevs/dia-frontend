import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartBarIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { DashboardAnalysis } from './use-dashboard-stats';
import { AnalysisStatus } from '@/enums/analysis';
import { Skeleton } from "@/components/ui/skeleton";

interface RecentAnalysesProps {
    analyses: DashboardAnalysis[];
    isLoading?: boolean;
}

export function RecentAnalyses({ analyses, isLoading = false }: RecentAnalysesProps) {
    const router = useRouter();

    const getStatusBadge = (status?: AnalysisStatus) => {
        switch (status) {
            case AnalysisStatus.COMPLETED:
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
                        Completed
                    </Badge>
                );
            case AnalysisStatus.IN_PROGRESS:
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        <ClockIcon className="w-3.5 h-3.5 mr-1" />
                        In Progress
                    </Badge>
                );
            case AnalysisStatus.FAILED:
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                        <ExclamationCircleIcon className="w-3.5 h-3.5 mr-1" />
                        Failed
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        Unknown
                    </Badge>
                );
        }
    };

    if (isLoading) {
        return (
            <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-6">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>

                <Skeleton className="h-10 w-full" />
            </Card>
        );
    }

    return (
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                    <ChartBarIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold">Recent Analyses</h3>
                    <p className="text-sm text-muted-foreground">
                        View your latest analysis results
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {analyses.length > 0 ? (
                    analyses.slice(0, 5).map((analysis) => (
                        <div
                            key={analysis.id}
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/dashboard/analysis/${analysis.document_id}/${analysis.id}`)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium truncate">{analysis.type}</h4>
                                {getStatusBadge(analysis.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                                Document ID: {analysis.document_id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No analyses found
                    </div>
                )}

                {analyses.length > 0 && (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/dashboard/analysis')}
                    >
                        View All Analyses
                    </Button>
                )}
            </div>
        </Card>
    );
} 