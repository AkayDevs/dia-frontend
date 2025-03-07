import { StepResultResponse } from '@/types/analysis/base';
import { AnalysisStatus } from '@/enums/analysis';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StepResultCardProps {
    result: StepResultResponse;
}

export const StepResultCard = ({ result }: StepResultCardProps) => {
    // Format step name for display
    const formatStepName = (stepId: string) => {
        return stepId
            .split('.')
            .map(part => part.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
            .join(' - ');
    };

    // Get status color
    const getStatusColor = (status: AnalysisStatus) => {
        switch (status) {
            case AnalysisStatus.COMPLETED:
                return 'bg-green-500';
            case AnalysisStatus.IN_PROGRESS:
                return 'bg-yellow-500';
            case AnalysisStatus.FAILED:
                return 'bg-red-500';
            default:
                return 'bg-blue-500';
        }
    };

    // Get badge variant based on status
    const getBadgeVariant = (status: AnalysisStatus) => {
        switch (status) {
            case AnalysisStatus.COMPLETED:
                return 'default';
            case AnalysisStatus.IN_PROGRESS:
                return 'secondary';
            case AnalysisStatus.FAILED:
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(result.status)}`} />
                        <CardTitle className="text-base">
                            {formatStepName(result.step_id)}
                        </CardTitle>
                    </div>
                    <Badge variant={getBadgeVariant(result.status)}>
                        {result.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {result.output && (
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex w-full justify-between p-3 rounded-none"
                            >
                                <span>View Results</span>
                                <ChevronDownIcon className="h-4 w-4 transition-transform ui-open:rotate-180" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="p-4 border-t bg-muted/10">
                                {typeof result.output === 'string' ? (
                                    <pre className="text-xs overflow-auto p-2 bg-muted/30 rounded-md max-h-[300px]">
                                        {result.output}
                                    </pre>
                                ) : (
                                    <pre className="text-xs overflow-auto p-2 bg-muted/30 rounded-md max-h-[300px]">
                                        {JSON.stringify(result.output, null, 2)}
                                    </pre>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
                {result.error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm">
                        <p className="font-medium mb-1">Error:</p>
                        <pre className="text-xs overflow-auto p-2 bg-red-100/50 dark:bg-red-950/30 rounded-md max-h-[200px]">
                            {result.error}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}; 