import { Document } from '@/types/document';
import { AnalysisRunWithResults } from '@/types/analysis/base';
import { AnalysisStatus } from '@/enums/analysis';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow, format } from 'date-fns';
import { AnalysisTypeIcon } from './AnalysisTypeIcon';
import { DocumentTypeIcon } from '@/components/documents';
import { ArrowRightIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Define missing interfaces to fix type errors
interface AnalysisStep {
    id: string;
    status: AnalysisStatus;
}

interface AnalysisDefinition {
    code: string;
}

// Extend the AnalysisRunWithResults type for our component
interface ExtendedAnalysisRun extends AnalysisRunWithResults {
    steps?: AnalysisStep[];
    definition?: AnalysisDefinition;
}

interface RecentAnalysisProps {
    document: Document;
    analyses: ExtendedAnalysisRun[];
    onViewAnalysis: (analysisId: string) => void;
    onViewDocument: (documentId: string) => void;
}

// Define a fixed card height
const CARD_HEIGHT = 380; // pixels

export const RecentAnalysisCard = ({
    document,
    analyses,
    onViewAnalysis,
    onViewDocument
}: RecentAnalysisProps) => {
    // Sort analyses by creation date (newest first)
    const sortedAnalyses = [...analyses].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Get the latest analysis
    const latestAnalysis = sortedAnalyses.length > 0 ? sortedAnalyses[0] : null;

    // Calculate progress for a single analysis
    const getProgress = (analysis: ExtendedAnalysisRun) => {
        if (!analysis) return 0;

        if (analysis.status === AnalysisStatus.COMPLETED) return 100;
        if (analysis.status === AnalysisStatus.FAILED) return 0;

        // If in progress, calculate based on steps
        if (analysis.status === AnalysisStatus.IN_PROGRESS && analysis.steps) {
            const totalSteps = analysis.steps.length;
            if (totalSteps === 0) return 0;

            const completedSteps = analysis.steps.filter(
                (step: AnalysisStep) => step.status === AnalysisStatus.COMPLETED
            ).length;

            return Math.round((completedSteps / totalSteps) * 100);
        }

        return 0;
    };

    // Get status badge variant
    const getStatusVariant = (status: AnalysisStatus | undefined) => {
        if (!status) return 'secondary';

        switch (status) {
            case AnalysisStatus.COMPLETED:
                return 'default';
            case AnalysisStatus.FAILED:
                return 'destructive';
            case AnalysisStatus.IN_PROGRESS:
                return 'secondary';
            default:
                return 'outline';
        }
    };

    // Get status icon
    const getStatusIcon = (status: AnalysisStatus | undefined) => {
        if (!status) return null;

        switch (status) {
            case AnalysisStatus.COMPLETED:
                return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
            case AnalysisStatus.FAILED:
                return <XCircleIcon className="h-4 w-4 text-red-500" />;
            case AnalysisStatus.IN_PROGRESS:
                return <ClockIcon className="h-4 w-4 text-amber-500" />;
            default:
                return null;
        }
    };

    const latestProgress = latestAnalysis ? getProgress(latestAnalysis) : 0;
    const analysisType = latestAnalysis?.analysis_code || 'text_analysis';

    return (
        <Card className="overflow-hidden transition-all hover:shadow-md h-[380px] flex flex-col">
            {/* Card Header - Fixed Height */}
            <CardHeader className="border-b bg-muted/30 py-3 px-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <DocumentTypeIcon type={document.type} className="text-primary h-6 w-6" />
                        <span className="truncate max-w-[200px]">{document.name}</span>
                    </CardTitle>
                    <Badge variant="outline" className="uppercase text-xs">
                        {document.type}
                    </Badge>
                </div>
                <CardDescription className="text-xs mt-1">
                    Uploaded {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                </CardDescription>
            </CardHeader>

            {/* Card Content - Flexible Height */}
            <CardContent className="p-4 flex-grow overflow-hidden">
                <div className="h-full flex flex-col">
                    {latestAnalysis ? (
                        <div className="flex flex-col h-full gap-3">
                            {/* Latest Analysis Section */}
                            <div className="flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <AnalysisTypeIcon type={analysisType} className="text-primary h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        Latest Analysis
                                    </span>
                                </div>
                                <Badge variant={getStatusVariant(latestAnalysis.status)} className="text-xs">
                                    {latestAnalysis.status}
                                </Badge>
                            </div>

                            {/* Progress Section */}
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                    <span>Progress</span>
                                    <span>{latestProgress}%</span>
                                </div>
                                <Progress value={latestProgress} className="h-1.5" />
                            </div>

                            <Separator className="flex-shrink-0 my-2" />

                            {/* Analysis History Section */}
                            <div className="flex-grow flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                                    <h4 className="text-sm font-medium flex items-center">
                                        <span>Analysis History</span>
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            {analyses.length}
                                        </Badge>
                                    </h4>
                                </div>

                                <ScrollArea className="flex-grow rounded-md border">
                                    <div className="p-1">
                                        {sortedAnalyses.map((analysis, index) => (
                                            <motion.div
                                                key={analysis.id || index}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors mb-1 last:mb-0"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="flex-shrink-0">
                                                        {getStatusIcon(analysis.status)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium truncate">
                                                            {analysis.analysis_code === 'table_analysis'
                                                                ? 'Table Analysis'
                                                                : analysis.analysis_code === 'text_analysis'
                                                                    ? 'Text Analysis'
                                                                    : 'Analysis'}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {format(new Date(analysis.created_at), 'MMM d, yyyy • h:mm a')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-xs"
                                                    onClick={() => analysis.id && onViewAnalysis(analysis.id as string)}
                                                >
                                                    View
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                            <p className="text-sm font-medium text-muted-foreground">No analyses yet</p>
                            <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                                Run an analysis to extract insights from this document
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Card Footer - Fixed Height */}
            <CardFooter className="border-t bg-muted/20 py-3 px-4 flex justify-between flex-shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDocument(document.id)}
                >
                    View Document
                </Button>
                {latestAnalysis && latestAnalysis.id && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewAnalysis(latestAnalysis.id as string)}
                        className="gap-1"
                    >
                        View Latest
                        <ArrowRightIcon className="h-3 w-3" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}; 