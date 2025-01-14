'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Analysis, AnalysisStepResult, AnalysisStatus } from '@/types/analysis';
import { analysisService } from '@/services/analysis.service';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { use } from 'react';
import { cn } from '@/lib/utils';

interface ResultsPageProps {
    params: Promise<{
        documentId: string;
        analysisId: string;
    }>;
}

export default function ResultsPage({ params }: ResultsPageProps) {
    const { documentId, analysisId } = use(params);
    const router = useRouter();
    const { toast } = useToast();

    const {
        currentAnalysis,
        fetchAnalysis,
        isLoading,
    } = useAnalysisStore();

    // Fetch analysis data
    useEffect(() => {
        if (!analysisId || currentAnalysis?.id !== analysisId) {
            fetchAnalysis(analysisId);
        }
    }, [analysisId, currentAnalysis, fetchAnalysis]);

    const handleBack = () => {
        router.push('/dashboard/analysis');
    };

    const handleExport = async (format: 'json' | 'csv') => {
        if (!currentAnalysis) return;

        try {
            toast({
                title: 'Export Started',
                description: `Preparing ${format.toUpperCase()} export...`,
            });

            await analysisService.downloadExport(currentAnalysis.id, format);

            toast({
                title: 'Export Complete',
                description: `Results have been downloaded in ${format.toUpperCase()} format.`,
            });
        } catch (error) {
            toast({
                title: 'Export Failed',
                description: error instanceof Error ? error.message : 'Failed to export results',
                variant: 'destructive',
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case AnalysisStatus.COMPLETED:
                return 'bg-green-500';
            case AnalysisStatus.FAILED:
                return 'bg-red-500';
            case AnalysisStatus.PROCESSING:
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStepProgress = (step: AnalysisStepResult) => {
        switch (step.status) {
            case AnalysisStatus.COMPLETED:
                return 100;
            case AnalysisStatus.FAILED:
                return 0;
            case AnalysisStatus.PROCESSING:
                return 50;
            default:
                return 0;
        }
    };

    if (isLoading || !currentAnalysis) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export Results
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExport('json')}>
                            <FileJson className="h-4 w-4 mr-2" />
                            Export as JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('csv')}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export as CSV
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Analysis Results</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                        'text-white',
                        getStatusColor(currentAnalysis.status)
                    )}>
                        {currentAnalysis.status}
                    </Badge>
                    {currentAnalysis.completed_at && (
                        <span className="text-sm text-muted-foreground">
                            Completed at: {new Date(currentAnalysis.completed_at).toLocaleString()}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid gap-6">
                {currentAnalysis.step_results.map((step, index) => (
                    <Card key={step.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">
                                        Step {index + 1}: {step.step_id.split('_').map(word =>
                                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                        ).join(' ')}
                                    </CardTitle>
                                    <CardDescription>
                                        Algorithm: {step.algorithm_id}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className={cn(
                                    'text-white',
                                    getStatusColor(step.status)
                                )}>
                                    {step.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Progress value={getStepProgress(step)} />

                                {step.error_message && (
                                    <div className="text-sm text-red-500">
                                        Error: {step.error_message}
                                    </div>
                                )}

                                {step.result && (
                                    <div className="mt-4">
                                        <h4 className="font-medium mb-2">Results:</h4>
                                        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                                            {JSON.stringify(step.result, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {step.user_corrections && (
                                    <div className="mt-4">
                                        <h4 className="font-medium mb-2">User Corrections:</h4>
                                        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                                            {JSON.stringify(step.user_corrections, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 