'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlgorithmConfig } from '@/components/analysis/automatic/algorithm-config';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AnalysisRequest, AnalysisType, Analysis, AnalysisStep, Parameter } from '@/types/analysis';
import { use } from 'react';

interface AutomaticModePageProps {
    params: Promise<{
        documentId: string;
    }>;
}

export default function AutomaticModePage({ params }: AutomaticModePageProps) {
    const { documentId } = use(params);
    const router = useRouter();
    const { toast } = useToast();

    const {
        startAnalysis,
        isLoading,
        error,
        clearError,
        currentAnalysis,
        fetchAnalysis,
    } = useAnalysisStore();

    const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null);
    const [stepConfigs, setStepConfigs] = useState<Record<string, {
        algorithm_id: string;
        parameters: Record<string, any>;
    }>>({});

    // Get the analysis type and current analysis from the setup flow
    useEffect(() => {
        const setupData = sessionStorage.getItem('analysis_setup');
        if (!setupData) {
            router.push(`/dashboard/analysis`);
            return;
        }

        try {
            const { selectedAnalysisType } = JSON.parse(setupData);
            if (!selectedAnalysisType) {
                router.push(`/dashboard/analysis`);
                return;
            }
            setAnalysisType(selectedAnalysisType);

            // Initialize step configurations with default algorithms
            const initialConfigs: Record<string, {
                algorithm_id: string;
                parameters: Record<string, any>;
            }> = {};

            selectedAnalysisType.steps.forEach((step: AnalysisStep) => {
                if (step.algorithms.length > 0) {
                    const defaultAlgorithm = step.algorithms[0];
                    const defaultParams = defaultAlgorithm.parameters.reduce((acc: Record<string, any>, param: Parameter) => {
                        acc[param.name] = param.default;
                        return acc;
                    }, {});

                    initialConfigs[step.id] = {
                        algorithm_id: defaultAlgorithm.id,
                        parameters: defaultParams
                    };
                }
            });

            setStepConfigs(initialConfigs);

            // Fetch the current analysis if it exists
            if (currentAnalysis?.document_id === documentId) {
                fetchAnalysis(currentAnalysis.id);
            }
        } catch (error) {
            console.error('Error parsing setup data:', error);
            router.push(`/dashboard/analysis`);
        }
    }, [documentId, router, currentAnalysis, fetchAnalysis]);

    const handleStepConfigChange = (stepId: string, config: {
        algorithm_id: string;
        parameters: Record<string, any>;
    }) => {
        setStepConfigs(prev => ({
            ...prev,
            [stepId]: config
        }));
    };

    const handleBack = () => {
        // If we have setup data, preserve it and go back to the analysis list
        try {
            const setupData = sessionStorage.getItem('analysis_setup');
            if (setupData) {
                // Clean up the analysis setup data since we're canceling
                sessionStorage.removeItem('analysis_setup');
            }
        } catch (error) {
            console.error('Error cleaning up setup data:', error);
        }

        // Go back to the main analysis page
        router.push(`/dashboard/analysis`);
    };

    const handleStartAnalysis = async () => {
        try {
            if (!analysisType) return;

            // Validate that all steps have an algorithm selected
            const missingSteps = analysisType.steps.filter(
                step => !stepConfigs[step.id] || !stepConfigs[step.id].algorithm_id
            );

            if (missingSteps.length > 0) {
                const stepNames = missingSteps.map(step =>
                    step.name.split('_').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ')
                ).join(', ');

                toast({
                    title: 'Algorithm Selection Required',
                    description: `Please select algorithms for the following steps: ${stepNames}`,
                    variant: 'destructive',
                });
                return;
            }

            const analysisRequest: AnalysisRequest = {
                analysis_type_id: analysisType.id,
                mode: 'automatic',
                algorithm_configs: stepConfigs,
            };

            await startAnalysis(documentId, analysisRequest);

            // Clear the setup data after successful start
            sessionStorage.removeItem('analysis_setup');

            // Navigate to results page with both documentId and analysisId
            router.push(`/dashboard/analysis/${documentId}/${currentAnalysis?.id}/results`);
            toast({
                title: 'Analysis Started',
                description: 'Your analysis has been started successfully.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to start analysis',
                variant: 'destructive',
            });
        }
    };

    if (!analysisType) {
        return null;
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
                    Back
                </Button>
            </div>

            <div className="flex flex-col gap-2 px-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {analysisType.name.split('_').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ')}
                </h1>
                {analysisType.description && (
                    <p className="text-muted-foreground">
                        {analysisType.description}
                    </p>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Automatic Analysis Configuration</CardTitle>
                    <CardDescription>
                        Configure the algorithms and parameters for each step of the analysis.
                        All steps will be executed automatically in sequence.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {analysisType.steps.map((step) => (
                            <AlgorithmConfig
                                key={step.id}
                                stepId={step.id}
                                stepName={step.name}
                                algorithms={step.algorithms}
                                onConfigChange={(config) =>
                                    handleStepConfigChange(step.id, config)
                                }
                            />
                        ))}

                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={handleStartAnalysis}
                                disabled={isLoading}
                                className="w-full sm:w-auto"
                            >
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Start Analysis
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}