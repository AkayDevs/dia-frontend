import { Document } from '@/types/document';
import { AnalysisRunWithResults } from '@/types/analysis/base';
import { AnalysisStatus } from '@/enums/analysis';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { AnalysisTypeIcon } from './AnalysisTypeIcon';
import { DocumentTypeIcon } from '@/components/documents';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface RecentAnalysisProps {
    document: Document;
    analyses: AnalysisRunWithResults[];
    onViewAnalysis: (analysisId: string) => void;
    onViewDocument: (documentId: string) => void;
}

export const RecentAnalysisCard = ({
    document,
    analyses,
    onViewAnalysis,
    onViewDocument
}: RecentAnalysisProps) => {
    // Get the latest analysis
    const latestAnalysis = analyses.length > 0
        ? analyses.reduce((latest, current) =>
            new Date(current.created_at) > new Date(latest.created_at) ? current : latest
        )
        : null;

    // Calculate progress
    const getProgress = () => {
        if (!latestAnalysis) return 0;

        if (latestAnalysis.status === AnalysisStatus.COMPLETED) return 100;
        if (latestAnalysis.status === AnalysisStatus.FAILED) return 0;

        // If in progress, calculate based on steps
        if (latestAnalysis.status === AnalysisStatus.IN_PROGRESS && latestAnalysis.steps) {
            const totalSteps = latestAnalysis.steps.length;
            if (totalSteps === 0) return 0;

            const completedSteps = latestAnalysis.steps.filter(
                step => step.status === AnalysisStatus.COMPLETED
            ).length;

            return Math.round((completedSteps / totalSteps) * 100);
        }

        return 0;
    };

    const progress = getProgress();
    const analysisType = latestAnalysis?.definition?.code || 'text_analysis';

    return (
        <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="border-b bg-muted/30 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <DocumentTypeIcon type={document.type} className="text-primary" />
                        <span className="truncate max-w-[200px]">{document.name}</span>
                    </CardTitle>
                    <Badge variant="outline" className="capitalize">
                        {document.type}
                    </Badge>
                </div>
                <CardDescription>
                    Uploaded {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                {latestAnalysis ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AnalysisTypeIcon type={analysisType} className="text-primary" />
                                <span className="text-sm font-medium">
                                    {analysisType === 'table_analysis'
                                        ? 'Table Analysis'
                                        : analysisType === 'text_analysis'
                                            ? 'Text Analysis'
                                            : 'Analysis'}
                                </span>
                            </div>
                            <Badge
                                variant={
                                    latestAnalysis.status === AnalysisStatus.COMPLETED
                                        ? 'default'
                                        : latestAnalysis.status === AnalysisStatus.FAILED
                                            ? 'destructive'
                                            : 'secondary'
                                }
                            >
                                {latestAnalysis.status}
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Started {formatDistanceToNow(new Date(latestAnalysis.created_at), { addSuffix: true })}
                            {latestAnalysis.completed_at && (
                                <> • Completed {formatDistanceToNow(new Date(latestAnalysis.completed_at), { addSuffix: true })}</>
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground">No analyses yet</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t bg-muted/20 pt-3 flex justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDocument(document.id)}
                >
                    View Document
                </Button>
                {latestAnalysis && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewAnalysis(latestAnalysis.id)}
                        className="gap-1"
                    >
                        View Analysis
                        <ArrowRightIcon className="h-3 w-3" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}; 