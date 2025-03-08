import { AnalysisStatus } from '@/enums/analysis';
import { AnalysisRunWithResults } from '@/types/analysis/base';
import { BarChart4, CheckCircle2, Clock, FileText } from 'lucide-react';

interface AnalysisMetricsOverviewProps {
    documents: any[];
    analysesArray: AnalysisRunWithResults[];
    analysisDefinitions: any[];
}

export function AnalysisMetricsOverview({
    documents,
    analysesArray,
    analysisDefinitions,
}: AnalysisMetricsOverviewProps) {
    return (
        <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 mr-1.5 text-blue-500/70" />
                        <span>Documents</span>
                    </div>
                    <p className="text-2xl font-semibold">{documents.length}</p>
                    <p className="text-xs text-muted-foreground">Available for analysis</p>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <BarChart4 className="h-4 w-4 mr-1.5 text-purple-500/70" />
                        <span>Analyses</span>
                    </div>
                    <p className="text-2xl font-semibold">{analysesArray.length}</p>
                    <p className="text-xs text-muted-foreground">Total runs</p>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500/70" />
                        <span>Completed</span>
                    </div>
                    <p className="text-2xl font-semibold">
                        {analysesArray.filter(a => a.status === AnalysisStatus.COMPLETED).length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {analysesArray.length > 0
                            ? `${Math.round((analysesArray.filter(a => a.status === AnalysisStatus.COMPLETED).length / analysesArray.length) * 100)}% success rate`
                            : 'No analyses yet'}
                    </p>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1.5 text-amber-500/70" />
                        <span>Analysis Types</span>
                    </div>
                    <p className="text-2xl font-semibold">{analysisDefinitions.length}</p>
                    <p className="text-xs text-muted-foreground">Available tools</p>
                </div>
            </div>

            {analysesArray.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-muted-foreground">
                                {analysesArray.filter(a => a.status === AnalysisStatus.COMPLETED).length} Completed
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                            <span className="text-xs text-muted-foreground">
                                {analysesArray.filter(a => a.status === AnalysisStatus.IN_PROGRESS).length} In Progress
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            <span className="text-xs text-muted-foreground">
                                {analysesArray.filter(a => a.status === AnalysisStatus.FAILED).length} Failed
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 