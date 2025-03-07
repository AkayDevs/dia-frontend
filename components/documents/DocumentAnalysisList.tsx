import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AnalysisStatus } from '@/enums/analysis';
import { AnalysisRunWithResults } from '@/types/analysis/base';
import { formatDistanceToNow } from 'date-fns';
import {
    ChartBarIcon,
    DocumentTextIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline';

interface DocumentAnalysisListProps {
    analyses: (AnalysisRunWithResults & { type?: string })[];
    onViewAnalysis: (analysisId: string) => void;
    onStartAnalysis: () => void;
    documentId: string;
}

export const DocumentAnalysisList = ({
    analyses,
    onViewAnalysis,
    onStartAnalysis,
    documentId
}: DocumentAnalysisListProps) => {
    if (analyses.length === 0) {
        return (
            <div className="text-center py-8">
                <ChartBarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No Analysis Available</h3>
                <p className="text-muted-foreground mb-4">Run an analysis to see insights about this document</p>
                <Button onClick={onStartAnalysis}>
                    Start Analysis
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {analyses.map((analysis) => (
                <Card key={analysis.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-sm font-medium">
                                {analysis.type === 'table_analysis' || analysis.definition?.code === 'table_analysis' ? (
                                    <div className="flex items-center gap-2">
                                        <TableCellsIcon className="w-4 h-4" />
                                        Table Analysis
                                    </div>
                                ) : analysis.type === 'text_analysis' || analysis.definition?.code === 'text_analysis' ? (
                                    <div className="flex items-center gap-2">
                                        <DocumentTextIcon className="w-4 h-4" />
                                        Text Analysis
                                    </div>
                                ) : (
                                    analysis.definition?.name || analysis.type || 'Analysis'
                                )}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                {analysis.status === AnalysisStatus.COMPLETED && analysis.completed_at ?
                                    `Completed ${formatDistanceToNow(new Date(analysis.completed_at), { addSuffix: true })}` :
                                    `Status: ${analysis.status}`
                                }
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewAnalysis(analysis.id)}
                        >
                            View Details
                        </Button>
                    </div>
                    {analysis.status === AnalysisStatus.IN_PROGRESS && (
                        <Progress value={33} className="h-2 mt-2" />
                    )}
                </Card>
            ))}
        </div>
    );
}; 