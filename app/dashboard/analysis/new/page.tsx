'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Document } from '@/types/document';
import { AnalysisDefinition } from '@/types/analysis/configs';
import { AnalysisRunConfig, AnalysisStepConfig } from '@/types/analysis/base';
import { AnalysisMode } from '@/enums/analysis';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Import modular components
import { AnalysisStepSidebar } from '@/components/analysis/new/AnalysisStepSidebar';
import { AnalysisStepContent } from '@/components/analysis/new/AnalysisStepContent';
import { DocumentSelection } from '@/components/analysis/new/document-selection';
import { AnalysisTypeSelection } from '@/components/analysis/new/analysis-type-selection';
import { AlgorithmConfiguration } from '@/components/analysis/new/AlgorithmConfiguration';
import { ModeSelection } from '@/components/analysis/new/mode-selection';
import { ReviewStep } from '@/components/analysis/new/ReviewStep';

// Define the steps for the setup process
export const setupSteps = [
    { id: 'document', title: 'Document Selection', icon: 'DocumentText', description: 'Select the document you want to analyze' },
    { id: 'analysis-type', title: 'Analysis Type', icon: 'Cog6Tooth', description: 'Choose the type of analysis to perform' },
    { id: 'algorithm', title: 'Algorithm Configuration', icon: 'LightBulb', description: 'Configure the algorithms and parameters' },
    { id: 'mode', title: 'Mode Selection', icon: 'Play', description: 'Choose between automatic or step-by-step processing' },
    { id: 'review', title: 'Review & Start', icon: 'CheckCircle', description: 'Review your configuration and start the analysis' }
];


export default function AnalysisSetupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [activeStep, setActiveStep] = useState('document');
    const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
        document: false,
        'analysis-type': false,
        algorithm: false,
        mode: false,
        review: false
    });
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisDefinition | null>(null);
    const [analysisConfig, setAnalysisConfig] = useState<AnalysisRunConfig>({
        steps: {} as Record<string, AnalysisStepConfig>,
        notifications: {
            notify_on_completion: true,
            notify_on_failure: true
        },
        metadata: {}
    });
    const [selectedMode, setSelectedMode] = useState<'automatic' | 'step_by_step' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        currentDefinition,
        availableAlgorithms,
        fetchAnalysisDefinition,
        startAnalysis,
        isLoading,
        currentAnalysis,
    } = useAnalysisStore();

    // Fetch analysis definition when selected
    useEffect(() => {
        if (selectedAnalysisType?.code) {
            fetchAnalysisDefinition(selectedAnalysisType.code);
        }
    }, [selectedAnalysisType, fetchAnalysisDefinition]);

    // Initialize empty step configs when analysis definition changes
    useEffect(() => {
        if (currentDefinition?.steps) {
            // Create initial config with empty values
            const initialStepsConfig: Record<string, AnalysisStepConfig> = {};

            currentDefinition.steps.forEach(step => {
                // Just initialize with enabled flag, no algorithm selection yet
                initialStepsConfig[step.code] = {
                    enabled: true,
                    algorithm: undefined
                };
            });

            setAnalysisConfig(prev => ({
                ...prev,
                steps: initialStepsConfig
            }));
        }
    }, [currentDefinition]);

    // Update completed steps when data changes
    useEffect(() => {
        const newCompletedSteps = {
            document: !!selectedDocument,
            'analysis-type': !!selectedAnalysisType,
            algorithm: false,
            mode: !!selectedMode,
            review: false,
        };

        // Only check algorithm parameters if we have a definition with steps
        if (currentDefinition?.steps && currentDefinition.steps.length > 0) {
            // Check if all required algorithm parameters are set
            newCompletedSteps.algorithm = currentDefinition.steps.every(step => {
                const stepConfig = analysisConfig.steps[step.code];

                // Skip disabled steps
                if (!stepConfig?.enabled) return true;

                // If no algorithm is selected, mark as incomplete
                if (!stepConfig.algorithm) return false;

                // Get the full step code
                const fullStepCode = `${currentDefinition.code}.${step.code}`;

                // Get algorithm with parameters from availableAlgorithms
                const algorithmWithParams = availableAlgorithms[fullStepCode]?.find(
                    algo => algo.code === stepConfig.algorithm?.code
                );

                // If we don't have the algorithm details yet, consider it complete for now
                if (!algorithmWithParams) return true;

                // If algorithm has parameters, check if all required ones are set
                if ('parameters' in algorithmWithParams) {
                    return (algorithmWithParams.parameters as any[])?.every(param => {
                        if (!param.required) return true;
                        const paramValue = stepConfig.algorithm?.parameters?.[param.name]?.value;
                        return paramValue !== undefined && paramValue !== null && paramValue !== '';
                    }) ?? true;
                }

                return true;
            });
        }

        // Only update state if values have changed to avoid infinite loops
        if (JSON.stringify(completedSteps) !== JSON.stringify(newCompletedSteps)) {
            setCompletedSteps(newCompletedSteps);
        }
    }, [selectedDocument, selectedAnalysisType, selectedMode, analysisConfig, currentDefinition, completedSteps, availableAlgorithms]);

    const handleStartAnalysis = async () => {
        if (!selectedDocument || !selectedAnalysisType || !selectedMode) {
            toast({
                title: "Missing information",
                description: "Please complete all required fields before starting the analysis.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Convert the selected mode to AnalysisMode enum
            const mode = selectedMode === 'automatic' ? AnalysisMode.AUTOMATIC : AnalysisMode.STEP_BY_STEP;

            await startAnalysis(
                selectedDocument.id,
                selectedAnalysisType.code,
                mode,
                analysisConfig
            );

            toast({
                title: "Analysis started",
                description: "Your analysis has been started successfully.",
            });

            // Navigate to the document analysis page
            router.push(`/dashboard/analysis/${currentAnalysis?.id}`);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to start analysis",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const canNavigateTo = (stepId: string) => {
        // Find the index of the target step
        const targetIndex = setupSteps.findIndex(step => step.id === stepId);

        // Check if all previous steps are completed
        return setupSteps
            .slice(0, targetIndex)
            .every(step => completedSteps[step.id]);
    };

    // Simplified function to initialize default algorithms when entering the algorithm step
    const initializeDefaultAlgorithms = () => {
        if (!currentDefinition?.steps) return;

        // Only initialize algorithms that haven't been set yet
        const updatedStepsConfig = { ...analysisConfig.steps };
        let hasChanges = false;

        currentDefinition.steps.forEach(step => {
            // Skip if algorithm is already configured
            if (updatedStepsConfig[step.code]?.algorithm?.code) return;

            // Default to first algorithm if available
            const defaultAlgorithm = step.algorithms[0];
            if (!defaultAlgorithm) return;

            // Update config with default algorithm (parameters will be set by AlgorithmConfiguration)
            updatedStepsConfig[step.code] = {
                ...updatedStepsConfig[step.code],
                algorithm: {
                    code: defaultAlgorithm.code,
                    version: defaultAlgorithm.version,
                    parameters: {}
                }
            };

            hasChanges = true;
        });

        // Only update state if changes were made
        if (hasChanges) {
            setAnalysisConfig(prev => ({
                ...prev,
                steps: updatedStepsConfig
            }));
        }
    };

    // Handle step change with simplified initialization
    const handleStepChange = (stepId: string) => {
        if (canNavigateTo(stepId)) {
            // Initialize default algorithms when moving to algorithm step
            if (stepId === 'algorithm' && activeStep !== 'algorithm') {
                initializeDefaultAlgorithms();
            }
            setActiveStep(stepId);
        } else {
            toast({
                title: "Complete previous steps",
                description: "Please complete all previous steps before proceeding.",
                variant: "destructive"
            });
        }
    };

    const handleNext = () => {
        const currentIndex = setupSteps.findIndex(step => step.id === activeStep);
        if (currentIndex < setupSteps.length - 1) {
            const nextStep = setupSteps[currentIndex + 1];
            if (canNavigateTo(nextStep.id)) {
                // Initialize default algorithms when moving to algorithm step
                if (nextStep.id === 'algorithm' && activeStep !== 'algorithm') {
                    initializeDefaultAlgorithms();
                }
                setActiveStep(nextStep.id);
            }
        }
    };

    const handleBack = () => {
        const currentIndex = setupSteps.findIndex(step => step.id === activeStep);
        if (currentIndex > 0) {
            setActiveStep(setupSteps[currentIndex - 1].id);
        } else {
            router.push('/dashboard/analysis');
        }
    };

    const isStartDisabled = () => {
        return !selectedDocument || !selectedAnalysisType || !selectedMode;
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 'document':
                return (
                    <DocumentSelection
                        selectedDocument={selectedDocument}
                        onSelect={setSelectedDocument}
                    />
                );
            case 'analysis-type':
                return (
                    <AnalysisTypeSelection
                        selectedDocument={selectedDocument}
                        selectedAnalysisType={selectedAnalysisType}
                        onSelect={(analysisType) => setSelectedAnalysisType(analysisType as AnalysisDefinition)}
                    />
                );
            case 'algorithm':
                return (
                    <AlgorithmConfiguration
                        currentDefinition={currentDefinition}
                        analysisConfig={analysisConfig}
                        onConfigChange={setAnalysisConfig}
                    />
                );
            case 'mode':
                return (
                    <ModeSelection
                        selectedMode={selectedMode}
                        onSelect={setSelectedMode}
                    />
                );
            case 'review':
                return (
                    <ReviewStep
                        selectedDocument={selectedDocument}
                        selectedAnalysisType={selectedAnalysisType}
                        selectedMode={selectedMode}
                        analysisConfig={analysisConfig}
                        currentDefinition={currentDefinition}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-6 py-10 max-w-7xl"
        >
            <div className="mb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">New Analysis</h1>
                        <p className="text-gray-500 mt-2.5 text-lg font-normal">Configure and run a document analysis</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard/analysis')}
                        className="flex items-center hover:bg-red-500 transition-colors"
                    >
                        <XMarkIcon className="h-4 w-4 mr-1.5" />
                        Cancel
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Progress Tracker Sidebar */}
                <div className="lg:col-span-1">
                    <AnalysisStepSidebar
                        steps={setupSteps}
                        activeStep={activeStep}
                        completedSteps={completedSteps}
                        canNavigateTo={canNavigateTo}
                        onStepChange={handleStepChange}
                        onStartAnalysis={handleStartAnalysis}
                        isStartDisabled={isStartDisabled()}
                        isSubmitting={isSubmitting}
                    />
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2">
                    <AnalysisStepContent
                        steps={setupSteps}
                        activeStep={activeStep}
                        completedSteps={completedSteps}
                        onNext={handleNext}
                        onBack={handleBack}
                        onStartAnalysis={handleStartAnalysis}
                        isStartDisabled={isStartDisabled()}
                        isSubmitting={isSubmitting}
                    >
                        {renderStepContent()}
                    </AnalysisStepContent>
                </div>
            </div>
        </motion.div>
    );
} 