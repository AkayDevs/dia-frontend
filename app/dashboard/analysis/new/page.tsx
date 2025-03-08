'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Steps } from '@/components/ui/steps';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DocumentSelection } from '@/components/analysis/setup/document-selection';
import { AnalysisTypeSelection } from '@/components/analysis/setup/analysis-type-selection';
import { ModeSelection } from '@/components/analysis/setup/mode-selection';
import { useToast } from '@/hooks/use-toast';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Document } from '@/types/document';
import { AnalysisDefinition, AnalysisStep, AnalysisAlgorithmInfo, AnalysisParameter } from '@/types/analysis/configs';
import { AnalysisRunConfig, AnalysisStepConfig, AnalysisAlgorithmConfig } from '@/types/analysis/base';
import { AnalysisMode } from '@/enums/analysis';
import { motion } from 'framer-motion';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    InformationCircleIcon,
    LightBulbIcon,
    PlayIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

// Define the steps for the setup process
const setupSteps = [
    { id: 'document', title: 'Document Selection', icon: DocumentTextIcon },
    { id: 'analysis-type', title: 'Analysis Type', icon: Cog6ToothIcon },
    { id: 'algorithm', title: 'Algorithm Configuration', icon: LightBulbIcon },
    { id: 'mode', title: 'Mode Selection', icon: PlayIcon },
    { id: 'review', title: 'Review & Start', icon: CheckCircleIcon }
];

export default function AnalysisSetupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisDefinition | null>(null);
    const [selectedMode, setSelectedMode] = useState<'automatic' | 'step_by_step' | null>(null);
    const [analysisConfig, setAnalysisConfig] = useState<AnalysisRunConfig>({
        steps: {},
        notifications: {
            notify_on_completion: true,
            notify_on_failure: true
        },
        metadata: {}
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHelpTips, setShowHelpTips] = useState(true);

    const {
        currentDefinition,
        fetchAnalysisDefinition,
        fetchStepAlgorithms,
        availableAlgorithms,
        startAnalysis,
        isLoading
    } = useAnalysisStore();

    // Fetch analysis definition when selected
    useEffect(() => {
        if (selectedAnalysisType?.id) {
            fetchAnalysisDefinition(selectedAnalysisType.id);
        }
    }, [selectedAnalysisType, fetchAnalysisDefinition]);

    // Initialize config when analysis definition changes
    useEffect(() => {
        if (currentDefinition?.steps) {
            // Create initial config with default values
            const initialStepsConfig: Record<string, AnalysisStepConfig> = {};

            currentDefinition.steps.forEach(step => {
                // Default to first algorithm if available
                const defaultAlgorithm = step.algorithms[0];

                if (defaultAlgorithm) {
                    // Fetch algorithms for this step
                    fetchStepAlgorithms(step.id);

                    // Create default parameters
                    const defaultParameters: Record<string, any> = {};
                    defaultAlgorithm.parameters.forEach(param => {
                        defaultParameters[param.name] = param.default;
                    });

                    initialStepsConfig[step.id] = {
                        enabled: true,
                        algorithm: {
                            code: defaultAlgorithm.code,
                            version: defaultAlgorithm.version,
                            parameters: defaultParameters
                        }
                    };
                }
            });

            setAnalysisConfig(prev => ({
                ...prev,
                steps: initialStepsConfig
            }));
        }
    }, [currentDefinition, fetchStepAlgorithms]);

    const handleNext = async () => {
        if (currentStep === setupSteps.length - 1) {
            await handleStartAnalysis();
            return;
        }
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        if (currentStep === 0) {
            router.push('/dashboard/analysis');
            return;
        }
        setCurrentStep((prev) => prev - 1);
    };

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
            await startAnalysis(
                selectedDocument.id,
                selectedAnalysisType.code,
                selectedMode === 'automatic' ? AnalysisMode.AUTOMATIC : AnalysisMode.STEP_BY_STEP,
                analysisConfig
            );

            toast({
                title: "Analysis started",
                description: "Your analysis has been started successfully.",
            });

            // Navigate to the document analysis page
            router.push(`/dashboard/analysis/document/${selectedDocument.id}`);
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

    const isNextDisabled = () => {
        switch (currentStep) {
            case 0:
                return !selectedDocument;
            case 1:
                return !selectedAnalysisType;
            case 2:
                // Check if all required parameters are filled
                if (!currentDefinition?.steps) return true;

                // For each enabled step, check if all required parameters are filled
                for (const step of currentDefinition.steps) {
                    const stepConfig = analysisConfig.steps[step.id];
                    if (!stepConfig?.enabled) continue;

                    // If no algorithm is selected, disable next
                    if (!stepConfig.algorithm) return true;

                    // Get the selected algorithm
                    const selectedAlgorithm = step.algorithms.find(
                        algo => algo.code === stepConfig.algorithm?.code
                    );

                    if (!selectedAlgorithm) return true;

                    // Check required parameters
                    for (const param of selectedAlgorithm.parameters) {
                        if (param.required) {
                            const paramValue = stepConfig.algorithm?.parameters?.[param.name]?.value;
                            if (paramValue === undefined || paramValue === null || paramValue === '') {
                                return true;
                            }
                        }
                    }
                }
                return false;
            case 3:
                return !selectedMode;
            default:
                return false;
        }
    };

    const handleAlgorithmChange = (stepId: string, algorithmCode: string, algorithmVersion: string) => {
        // Find the algorithm to get default parameters
        const step = currentDefinition?.steps.find(s => s.id === stepId);
        const algorithm = step?.algorithms.find(a => a.code === algorithmCode);

        if (!algorithm) return;

        // Create default parameters
        const defaultParameters: Record<string, any> = {};
        algorithm.parameters.forEach(param => {
            defaultParameters[param.name] = {
                name: param.name,
                value: param.default
            };
        });

        // Update config
        setAnalysisConfig(prev => ({
            ...prev,
            steps: {
                ...prev.steps,
                [stepId]: {
                    ...prev.steps[stepId],
                    algorithm: {
                        code: algorithmCode,
                        version: algorithmVersion,
                        parameters: defaultParameters
                    }
                }
            }
        }));
    };

    const handleParameterChange = (stepId: string, paramName: string, value: any) => {
        setAnalysisConfig(prev => ({
            ...prev,
            steps: {
                ...prev.steps,
                [stepId]: {
                    ...prev.steps[stepId],
                    algorithm: {
                        ...prev.steps[stepId].algorithm!,
                        parameters: {
                            ...prev.steps[stepId].algorithm!.parameters,
                            [paramName]: {
                                name: paramName,
                                value
                            }
                        }
                    }
                }
            }
        }));
    };

    const handleStepToggle = (stepId: string, enabled: boolean) => {
        setAnalysisConfig(prev => ({
            ...prev,
            steps: {
                ...prev.steps,
                [stepId]: {
                    ...prev.steps[stepId],
                    enabled
                }
            }
        }));
    };

    const handleUseDefaultParameters = (stepId: string) => {
        const step = currentDefinition?.steps.find(s => s.id === stepId);
        const algorithmCode = analysisConfig.steps[stepId]?.algorithm?.code;
        const algorithm = step?.algorithms.find(a => a.code === algorithmCode);

        if (!algorithm) return;

        // Create default parameters
        const defaultParameters: Record<string, any> = {};
        algorithm.parameters.forEach(param => {
            defaultParameters[param.name] = {
                name: param.name,
                value: param.default
            };
        });

        // Update config
        setAnalysisConfig(prev => ({
            ...prev,
            steps: {
                ...prev.steps,
                [stepId]: {
                    ...prev.steps[stepId],
                    algorithm: {
                        ...prev.steps[stepId].algorithm!,
                        parameters: defaultParameters
                    }
                }
            }
        }));

        toast({
            description: "Default parameters applied",
        });
    };

    const renderAlgorithmConfiguration = () => {
        if (!currentDefinition || !currentDefinition.steps || currentDefinition.steps.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-[400px]">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-4 w-48 mt-4" />
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Configure Analysis Algorithms</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHelpTips(!showHelpTips)}
                            className="text-xs flex items-center gap-1.5"
                        >
                            <InformationCircleIcon className="h-4 w-4" />
                            {showHelpTips ? 'Hide Tips' : 'Show Tips'}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Customize how each step of the analysis process will be performed.
                    </p>

                    {showHelpTips && (
                        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-700 flex items-start space-x-2.5">
                            <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium mb-1">Tips for configuration:</p>
                                <ul className="list-disc pl-5 space-y-1 text-blue-600 text-xs">
                                    <li>Toggle steps on/off using the switches</li>
                                    <li>Each step can use different algorithms with unique parameters</li>
                                    <li>Required parameters are marked with an asterisk (*)</li>
                                    <li>Use "Default Parameters" to reset to recommended values</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {currentDefinition.steps.map((step, index) => {
                        const stepConfig = analysisConfig.steps[step.id] || {
                            enabled: true,
                            algorithm: undefined
                        };

                        const selectedAlgorithmCode = stepConfig.algorithm?.code;
                        const selectedAlgorithm = step.algorithms.find(
                            algo => algo.code === selectedAlgorithmCode
                        );

                        return (
                            <Card
                                key={step.id}
                                className={`transition-all duration-200 ${!stepConfig.enabled ? 'opacity-70 bg-muted/20' : 'hover:shadow-md'}`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                                Step {index + 1}
                                            </Badge>
                                            <h3 className="font-medium">
                                                {step.name.split('_').map(word =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`toggle-${step.id}`} className="text-xs text-muted-foreground mr-1">
                                                {stepConfig.enabled ? 'Enabled' : 'Disabled'}
                                            </Label>
                                            <Switch
                                                id={`toggle-${step.id}`}
                                                checked={stepConfig.enabled}
                                                onCheckedChange={(checked) => handleStepToggle(step.id, checked)}
                                            />
                                        </div>
                                    </div>
                                </CardHeader>

                                {stepConfig.enabled ? (
                                    <CardContent className="pt-0">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Algorithm Selection</Label>
                                                <Select
                                                    value={selectedAlgorithmCode}
                                                    onValueChange={(value) => {
                                                        const algorithm = step.algorithms.find(a => a.code === value);
                                                        if (algorithm) {
                                                            handleAlgorithmChange(step.id, algorithm.code, algorithm.version);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select algorithm" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {step.algorithms.map((algorithm) => (
                                                            <SelectItem key={algorithm.code} value={algorithm.code}>
                                                                {algorithm.name.split('_').map(word =>
                                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                                ).join(' ')}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {selectedAlgorithm && (
                                                <>
                                                    {selectedAlgorithm.description && (
                                                        <div className="bg-muted/30 p-3 rounded-md text-sm border border-muted">
                                                            <div className="flex items-start">
                                                                <InformationCircleIcon className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                                                                <p className="text-muted-foreground">
                                                                    {selectedAlgorithm.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-sm font-medium">Parameters</h4>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleUseDefaultParameters(step.id)}
                                                            className="text-xs"
                                                        >
                                                            <LightBulbIcon className="h-3.5 w-3.5 mr-1.5" />
                                                            Reset to Defaults
                                                        </Button>
                                                    </div>

                                                    {selectedAlgorithm.parameters.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground italic">
                                                            This algorithm has no configurable parameters.
                                                        </p>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {selectedAlgorithm.parameters.map((param) => (
                                                                <div key={param.name} className="space-y-1.5 bg-muted/10 p-3 rounded-md border border-muted/50">
                                                                    <Label className="text-sm flex items-center">
                                                                        {param.name.split('_').map(word =>
                                                                            word.charAt(0).toUpperCase() + word.slice(1)
                                                                        ).join(' ')}
                                                                        {param.required && <span className="text-destructive ml-1 font-medium">*</span>}
                                                                    </Label>

                                                                    {renderParameterInput(step.id, param, stepConfig)}

                                                                    {param.description && (
                                                                        <p className="text-xs text-muted-foreground mt-1.5">
                                                                            {param.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                ) : (
                                    <CardContent>
                                        <div className="py-2 text-sm text-muted-foreground flex items-center">
                                            <XMarkIcon className="h-4 w-4 mr-2 text-muted-foreground/70" />
                                            This step is disabled and will be skipped during analysis.
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderParameterInput = (stepId: string, param: AnalysisParameter, stepConfig: AnalysisStepConfig) => {
        const value = stepConfig.algorithm?.parameters?.[param.name]?.value ?? param.default;

        switch (param.type.toLowerCase()) {
            case 'number':
                return (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleParameterChange(stepId, param.name, parseFloat(e.target.value))}
                        className="h-9 mt-1"
                    />
                );
            case 'boolean':
                return (
                    <div className="flex items-center h-9 mt-1">
                        <Switch
                            checked={value}
                            onCheckedChange={(checked) => handleParameterChange(stepId, param.name, checked)}
                        />
                        <span className="ml-2 text-sm">{value ? 'Enabled' : 'Disabled'}</span>
                    </div>
                );
            case 'select':
                return (
                    <Select
                        value={value}
                        onValueChange={(value) => handleParameterChange(stepId, param.name, value)}
                    >
                        <SelectTrigger className="h-9 mt-1">
                            <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                            {param.constraints?.options?.map((option: string) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            default:
                return (
                    <Input
                        type="text"
                        value={value}
                        onChange={(e) => handleParameterChange(stepId, param.name, e.target.value)}
                        className="h-9 mt-1"
                    />
                );
        }
    };

    const renderReviewStep = () => {
        if (!selectedDocument || !selectedAnalysisType || !currentDefinition) {
            return (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Missing information. Please go back and complete all steps.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Review Analysis Configuration</h2>
                    <p className="text-sm text-muted-foreground">
                        Verify your analysis setup before starting the process.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="overflow-hidden shadow-sm">
                        <div className="bg-blue-500 h-1.5 w-full"></div>
                        <CardHeader className="pb-2">
                            <div className="flex items-center">
                                <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-2" />
                                <h3 className="text-sm font-medium">Document</h3>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium">{selectedDocument.name}</p>
                            <p className="text-xs text-muted-foreground">Type: {selectedDocument.type}</p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden shadow-sm">
                        <div className="bg-purple-500 h-1.5 w-full"></div>
                        <CardHeader className="pb-2">
                            <div className="flex items-center">
                                <Cog6ToothIcon className="h-5 w-5 text-purple-500 mr-2" />
                                <h3 className="text-sm font-medium">Analysis Type</h3>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium">
                                {selectedAnalysisType.name.split('_').map(word =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                            </p>
                            {selectedAnalysisType.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {selectedAnalysisType.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden shadow-sm">
                        <div className="bg-amber-500 h-1.5 w-full"></div>
                        <CardHeader className="pb-2">
                            <div className="flex items-center">
                                <PlayIcon className="h-5 w-5 text-amber-500 mr-2" />
                                <h3 className="text-sm font-medium">Execution Mode</h3>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium">
                                {selectedMode === 'automatic' ? 'Automatic Mode' : 'Step-by-Step Mode'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {selectedMode === 'automatic'
                                    ? 'The analysis will run automatically without user intervention.'
                                    : 'You will be guided through each step of the analysis process.'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden shadow-sm">
                        <div className="bg-green-500 h-1.5 w-full"></div>
                        <CardHeader className="pb-2">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                <h3 className="text-sm font-medium">Notifications</h3>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center">
                                    <Switch
                                        checked={analysisConfig.notifications.notify_on_completion}
                                        onCheckedChange={(checked) => setAnalysisConfig(prev => ({
                                            ...prev,
                                            notifications: {
                                                ...prev.notifications,
                                                notify_on_completion: checked
                                            }
                                        }))}
                                        className="mr-2"
                                    />
                                    <Label className="text-sm">Notify on completion</Label>
                                </div>
                                <div className="flex items-center">
                                    <Switch
                                        checked={analysisConfig.notifications.notify_on_failure}
                                        onCheckedChange={(checked) => setAnalysisConfig(prev => ({
                                            ...prev,
                                            notifications: {
                                                ...prev.notifications,
                                                notify_on_failure: checked
                                            }
                                        }))}
                                        className="mr-2"
                                    />
                                    <Label className="text-sm">Notify on failure</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <div className="bg-slate-500 h-1.5 w-full"></div>
                    <CardHeader className="pb-2">
                        <div className="flex items-center">
                            <Cog6ToothIcon className="h-5 w-5 text-slate-500 mr-2" />
                            <h3 className="text-sm font-medium">Algorithm Configuration</h3>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[250px] pr-4">
                            <div className="space-y-4">
                                {currentDefinition.steps.map((step, index) => {
                                    const stepConfig = analysisConfig.steps[step.id];
                                    if (!stepConfig) return null;

                                    const selectedAlgorithm = step.algorithms.find(
                                        algo => algo.code === stepConfig.algorithm?.code
                                    );

                                    return (
                                        <div key={step.id} className={`p-3 rounded-md border ${stepConfig.enabled ? 'bg-white' : 'bg-muted/20'}`}>
                                            <div className="flex items-center">
                                                <Badge className="mr-2 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                                    Step {index + 1}
                                                </Badge>
                                                <span className="text-sm font-medium">
                                                    {step.name.split('_').map(word =>
                                                        word.charAt(0).toUpperCase() + word.slice(1)
                                                    ).join(' ')}
                                                </span>
                                                {!stepConfig.enabled && (
                                                    <Badge variant="outline" className="ml-2 text-muted-foreground">
                                                        Disabled
                                                    </Badge>
                                                )}
                                            </div>

                                            {stepConfig.enabled && selectedAlgorithm && (
                                                <div className="pl-6 mt-2 space-y-2">
                                                    <p className="text-xs flex items-center">
                                                        <span className="text-muted-foreground mr-1">Algorithm:</span>{' '}
                                                        <span className="font-medium">
                                                            {selectedAlgorithm.name.split('_').map(word =>
                                                                word.charAt(0).toUpperCase() + word.slice(1)
                                                            ).join(' ')}
                                                        </span>
                                                    </p>

                                                    {selectedAlgorithm.parameters.length > 0 && (
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-muted-foreground">Parameters:</p>
                                                            <div className="pl-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                                                {selectedAlgorithm.parameters.map(param => {
                                                                    const paramValue = stepConfig.algorithm?.parameters?.[param.name]?.value;
                                                                    return (
                                                                        <p key={param.name} className="text-xs flex items-center">
                                                                            <span className="text-muted-foreground mr-1">
                                                                                {param.name.split('_').map(word =>
                                                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                                                ).join(' ')}:
                                                                            </span>{' '}
                                                                            <span className={`${param.required && (paramValue === undefined || paramValue === null || paramValue === '') ? 'text-destructive' : ''}`}>
                                                                                {paramValue !== undefined && paramValue !== null
                                                                                    ? String(paramValue)
                                                                                    : 'Not set'}
                                                                            </span>
                                                                            {param.required && (paramValue === undefined || paramValue === null || paramValue === '') && (
                                                                                <span className="text-destructive ml-1 text-xs">*</span>
                                                                            )}
                                                                        </p>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-blue-700 flex items-start space-x-3">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium mb-1">Ready to start your analysis</p>
                        <p className="text-blue-600 text-xs">
                            Once you start the analysis, you'll be redirected to the analysis dashboard where you can monitor progress
                            {selectedMode === 'step_by_step' ? ' and control each step of the process.' : '.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <DocumentSelection
                        selectedDocument={selectedDocument}
                        onSelect={setSelectedDocument}
                    />
                );
            case 1:
                return (
                    <AnalysisTypeSelection
                        selectedDocument={selectedDocument}
                        selectedAnalysisType={selectedAnalysisType}
                        onSelect={(analysisType) => setSelectedAnalysisType(analysisType as AnalysisDefinition)}
                    />
                );
            case 2:
                return renderAlgorithmConfiguration();
            case 3:
                return (
                    <ModeSelection
                        selectedMode={selectedMode}
                        onSelect={setSelectedMode}
                    />
                );
            case 4:
                return renderReviewStep();
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-8"
        >
            <Card className="max-w-5xl mx-auto shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">New Analysis</h1>
                            <p className="text-sm opacity-90 mt-1">Configure and run a new document analysis</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/dashboard/analysis')}
                            className="text-white hover:bg-white/20"
                        >
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Cancel
                        </Button>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <div className="mb-8">
                        <Steps
                            steps={setupSteps}
                            currentStep={currentStep}
                        />
                    </div>

                    <div className="min-h-[400px] mb-8">
                        {renderStep()}
                    </div>

                    <Separator className="mb-6" />

                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="flex items-center"
                            disabled={isSubmitting}
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
                            {currentStep === 0 ? 'Cancel' : 'Back'}
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={isNextDisabled() || isSubmitting}
                            className={`flex items-center ${currentStep === setupSteps.length - 1 ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                    Processing...
                                </>
                            ) : currentStep === setupSteps.length - 1 ? (
                                <>
                                    <PlayIcon className="h-4 w-4 mr-1.5" />
                                    Start Analysis
                                </>
                            ) : (
                                <>
                                    Next
                                    <ArrowRightIcon className="h-4 w-4 ml-1.5" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
} 