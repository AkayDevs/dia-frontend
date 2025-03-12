import { AnalysisStatus } from '@/enums/analysis';
import { AnalysisRunWithResults, AnalysisRunWithResultsInfo } from '@/types/analysis/base';
import { BarChart4, CheckCircle2, Clock, FileText } from 'lucide-react';

interface AnalysisMetricsOverviewProps {
    documents: any[];
    analysesArray: (AnalysisRunWithResults | AnalysisRunWithResultsInfo)[];
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
                <div className="space-y-1.5 p-3 bg-card/30 rounded-md border border-border/30 transition-all hover:border-border/50 hover:shadow-sm">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-500/80" />
                        <span className="text-xs font-medium">Documents</span>
                    </div>
                    <p className="text-xl font-semibold text-foreground/90">{documents.length}</p>
                    <p className="text-xs text-muted-foreground">Available for analysis</p>
                </div>

                <div className="space-y-1.5 p-3 bg-card/30 rounded-md border border-border/30 transition-all hover:border-border/50 hover:shadow-sm">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <BarChart4 className="h-3.5 w-3.5 mr-1.5 text-purple-500/80" />
                        <span className="text-xs font-medium">Analyses</span>
                    </div>
                    <p className="text-xl font-semibold text-foreground/90">{analysesArray.length}</p>
                    <p className="text-xs text-muted-foreground">Total runs</p>
                </div>

                <div className="space-y-1.5 p-3 bg-card/30 rounded-md border border-border/30 transition-all hover:border-border/50 hover:shadow-sm">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500/80" />
                        <span className="text-xs font-medium">Completed</span>
                    </div>
                    <p className="text-xl font-semibold text-foreground/90">
                        {analysesArray.filter(a => a.status === AnalysisStatus.COMPLETED).length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {analysesArray.length > 0
                            ? `${Math.round((analysesArray.filter(a => a.status === AnalysisStatus.COMPLETED).length / analysesArray.length) * 100)}% success rate`
                            : 'No analyses yet'}
                    </p>
                </div>

                <div className="space-y-1.5 p-3 bg-card/30 rounded-md border border-border/30 transition-all hover:border-border/50 hover:shadow-sm">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500/80" />
                        <span className="text-xs font-medium">Analysis Types</span>
                    </div>
                    <p className="text-xl font-semibold text-foreground/90">{analysisDefinitions.length}</p>
                    <p className="text-xs text-muted-foreground">Available tools</p>
                </div>
            </div>

            {analysesArray.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/30">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-green-500/90"></div>
                            <span className="text-xs text-muted-foreground">
                                {analysesArray.filter(a => a.status === AnalysisStatus.COMPLETED).length} Completed
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-amber-500/90"></div>
                            <span className="text-xs text-muted-foreground">
                                {analysesArray.filter(a => a.status === AnalysisStatus.IN_PROGRESS).length} In Progress
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-red-500/90"></div>
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