import { Card } from '@/components/ui/card';
import { UserStats } from '@/services/document.service';
import { DocumentIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface StatsOverviewProps {
    stats: UserStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    const calculatePercentage = (current: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((current / total) * 100);
    };

    const analysisPercentage = calculatePercentage(stats.documents_analyzed, stats.total_documents);

    return (
        <div className="grid gap-4 md:grid-cols-2 mb-8 w-full">
            <Card className="p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                        <DocumentIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Documents</p>
                        <h3 className="text-2xl font-semibold">{stats.total_documents}</h3>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                        <ChartBarIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Analyzed Documents</p>
                        <h3 className="text-2xl font-semibold">{stats.documents_analyzed}</h3>
                        <p className="text-xs text-muted-foreground">
                            {analysisPercentage}% of total documents
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
} 