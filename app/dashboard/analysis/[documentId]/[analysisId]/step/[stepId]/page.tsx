'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, RefreshCw, Save, Settings } from 'lucide-react';
import { Analysis, AnalysisStepResult, AnalysisStatus } from '@/types/analysis';
import { StepOutput, StepOutputType } from '@/types/results';
import { Badge } from '@/components/ui/badge';
import { use } from 'react';
import { cn } from '@/lib/utils';
import { StepResultVisualizer } from '@/components/analysis/step/step-result-visualizer';
import { StepCorrectionsEditor } from '@/components/analysis/step/step-corrections-editor';

interface StepPageProps {
    params: Promise<{
        documentId: string;
        analysisId: string;
        stepId: string;
    }>;
}

// Helper function to format step name
const formatStepName = (name: string): string => {
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export default function StepPage({ params }: StepPageProps) {
    const { documentId, analysisId, stepId } = use(params);
    const router = useRouter();
    const { toast } = useToast();

    const {
        currentAnalysis,
        currentAnalysisType,
        fetchAnalysis,
        fetchAnalysisType,
        updateStepCorrections,
        executeStep,
        isLoading,
    } = useAnalysisStore();

    const [corrections, setCorrections] = useState<Record<string, any>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Fetch analysis data
    useEffect(() => {
        if (!analysisId || currentAnalysis?.id !== analysisId) {
            fetchAnalysis(analysisId);
        }
    }, [analysisId, currentAnalysis, fetchAnalysis]);

    // Fetch analysis type data
    useEffect(() => {
        if (currentAnalysis && !currentAnalysisType) {
            fetchAnalysisType(currentAnalysis.analysis_type_id);
        }
    }, [currentAnalysis, currentAnalysisType, fetchAnalysisType]);

    const currentStep = currentAnalysis?.step_results.find(
        step => step.step_id === stepId
    );

    const stepName = currentAnalysisType?.steps.find(
        step => step.id === stepId
    )?.name || 'Unknown Step';

    const currentStepIndex = currentAnalysis?.step_results.findIndex(
        step => step.step_id === stepId
    ) ?? -1;

    const nextStep = currentAnalysis?.step_results[currentStepIndex + 1];
    const previousStep = currentAnalysis?.step_results[currentStepIndex - 1];

    const handleCorrectionsChange = (newCorrections: Record<string, any>) => {
        setCorrections(newCorrections);
        setHasUnsavedChanges(true);
    };

    const handleSaveCorrections = async () => {
        if (!currentStep) return;

        try {
            await updateStepCorrections(analysisId, stepId, corrections);
            setHasUnsavedChanges(false);
            toast({
                title: 'Changes Saved',
                description: 'Your corrections have been saved successfully.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to save corrections',
                variant: 'destructive',
            });
        }
    };

    const handleRerunStep = async () => {
        if (!currentStep) return;

        try {
            await executeStep(analysisId, stepId, {
                algorithm_id: currentStep.algorithm_id,
                parameters: currentStep.parameters
            });
            toast({
                title: 'Step Restarted',
                description: 'The step has been restarted with your corrections.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to restart step',
                variant: 'destructive',
            });
        }
    };

    const handleNavigateToStep = (step: AnalysisStepResult | undefined) => {
        if (!step) return;
        router.push(`/dashboard/analysis/${documentId}/${analysisId}/step/${step.step_id}`);
    };

    const handleBack = () => {
        router.push(`/dashboard/analysis/${documentId}/${analysisId}/results`);
    };

    if (isLoading || !currentAnalysis || !currentStep) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="h-8 w-8 animate-spin" />
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
                    Back to Results
                </Button>

                <div className="flex items-center gap-2">
                    {previousStep && (
                        <Button
                            variant="outline"
                            onClick={() => handleNavigateToStep(previousStep)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Previous Step
                        </Button>
                    )}
                    {nextStep && (
                        <Button
                            onClick={() => handleNavigateToStep(nextStep)}
                            className="flex items-center gap-2"
                        >
                            Next Step
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Step {currentStepIndex + 1}: {formatStepName(stepName)}
                    </h1>
                    <Badge variant="outline" className={cn(
                        'text-white',
                        currentStep?.status === AnalysisStatus.COMPLETED ? 'bg-green-500' :
                            currentStep?.status === AnalysisStatus.FAILED ? 'bg-red-500' :
                                currentStep?.status === AnalysisStatus.PROCESSING ? 'bg-blue-500' :
                                    'bg-gray-500'
                    )}>
                        {currentStep?.status || 'Unknown'}
                    </Badge>
                </div>
                {currentStep.error_message && (
                    <p className="text-sm text-red-500">
                        Error: {currentStep.error_message}
                    </p>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Results Visualization */}
                <Card>
                    <CardHeader>
                        <CardTitle>Results Preview</CardTitle>
                        <CardDescription>
                            Visual representation of the current step results
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StepResultVisualizer
                            stepId={stepId}
                            result={currentStep.result as StepOutput | null}
                            corrections={currentStep.user_corrections}
                            documentId={documentId}
                            stepName={stepName}
                        />
                    </CardContent>

                    {/* <CardFooter>
                        <Button variant="outline" onClick={handleRerunStep} disabled={isLoading} className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Re-run Step
                        </Button>
                    </CardFooter> */}
                </Card>

                {/* Corrections Editor */}
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Results</CardTitle>
                        <CardDescription>
                            Make corrections to the detected results
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StepCorrectionsEditor
                            stepId={stepId}
                            result={currentStep.result || null}
                            corrections={corrections}
                            onChange={handleCorrectionsChange}
                        />

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={handleRerunStep}
                                disabled={isLoading}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Re-run Step
                            </Button>
                            <Button
                                onClick={handleSaveCorrections}
                                disabled={!hasUnsavedChanges || isLoading}
                                className="flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 