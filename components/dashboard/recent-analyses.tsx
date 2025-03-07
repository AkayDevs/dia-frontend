import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { DashboardAnalysis } from './use-dashboard-stats';
import { AnalysisStatus } from '@/enums/analysis';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RecentAnalysesProps {
    analyses: DashboardAnalysis[];
    isLoading?: boolean;
    className?: string;
}

export function RecentAnalyses({ analyses, isLoading = false, className = '' }: RecentAnalysesProps) {
    const router = useRouter();

    const getStatusBadge = (status?: AnalysisStatus) => {
        if (!status) return null;

        switch (status) {
            case AnalysisStatus.COMPLETED:
                return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
            case AnalysisStatus.PENDING:
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
            case AnalysisStatus.IN_PROGRESS:
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
            case AnalysisStatus.FAILED:
                return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <Card className="h-full flex flex-col">
                <div className="p-6 pb-4 border-b">
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-6 py-4">
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-lg" />
                        ))}
                    </div>
                </div>

                <div className="p-6 pt-4 border-t">
                    <Skeleton className="h-10 w-full" />
                </div>
            </Card>
        );
    }

    return (
        <Card className={`h-full flex flex-col ${className}`}>
            <div className="p-6 pb-4 border-b">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <ChartBarIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold">Recent Analyses</h3>
                        <p className="text-sm text-muted-foreground">
                            Your most recent document analyses
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-6 py-4">
                {analyses.length > 0 ? (
                    <ScrollArea className="h-[250px]">
                        <div className="space-y-3 pr-4">
                            {analyses.slice(0, 5).map((analysis, index) => (
                                <div
                                    key={analysis.id || index}
                                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/dashboard/analysis/${analysis.document_id}/${analysis.id}`)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium truncate">{analysis.displayName}</span>
                                                {getStatusBadge(analysis.status)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(analysis.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                        No analyses found
                    </div>
                )}
            </div>

            <div className="p-6 pt-4 border-t">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/dashboard/analysis')}
                >
                    View All Analyses
                </Button>
            </div>
        </Card>
    );
} 