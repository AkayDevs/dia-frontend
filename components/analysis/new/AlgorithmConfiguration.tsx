import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { InformationCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/hooks/use-toast';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { AnalysisDefinition, AnalysisParameter } from '@/types/analysis/configs';
import { AnalysisRunConfig, AnalysisStepConfig } from '@/types/analysis/base';

interface AlgorithmConfigurationProps {
    currentDefinition: AnalysisDefinition | null;
    analysisConfig: AnalysisRunConfig;
    onConfigChange: (config: AnalysisRunConfig) => void;
}

// Type for algorithm with parameters
interface AlgorithmWithParameters {
    code: string;
    name: string;
    version: string;
    parameters?: AnalysisParameter[];
    [key: string]: any;
}

export function AlgorithmConfiguration({
    currentDefinition,
    analysisConfig,
    onConfigChange
}: AlgorithmConfigurationProps) {
    const { toast } = useToast();
    const [showHelpTips, setShowHelpTips] = useState(true);
    const { fetchStepAlgorithms, availableAlgorithms } = useAnalysisStore();
    const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

    // Use refs to track initialization state and prevent infinite loops
    const initializedStepsRef = useRef<Record<string, boolean>>({});

    // Helper function to get the full step code
    const getFullStepCode = (stepCode: string): string => {
        if (!currentDefinition) return '';
        return `${currentDefinition.code}.${stepCode}`;
    };

    // Fetch algorithms for all steps when component mounts
    useEffect(() => {
        if (!currentDefinition?.steps) return;

        currentDefinition.steps.forEach(step => {
            const fullStepCode = getFullStepCode(step.code);
            if (fullStepCode) {
                fetchStepAlgorithms(fullStepCode);
            }
        });
    }, [currentDefinition, fetchStepAlgorithms]);

    // We're removing the auto-initialization of parameters
    // Parameters will only be set when the user explicitly chooses to customize them

    if (!currentDefinition) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px]">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-48 rounded-md mb-2" />
                <Skeleton className="h-4 w-64 rounded-md" />
            </div>
        );
    }

    // Helper function to get algorithm with parameters
    const getAlgorithmWithParams = (stepCode: string, algorithmCode: string) => {
        const step = currentDefinition.steps.find(s => s.code === stepCode);
        const fullStepCode = getFullStepCode(stepCode);

        return availableAlgorithms[fullStepCode]?.find(a => a.code === algorithmCode) ||
            step?.algorithms.find(a => a.code === algorithmCode);
    };

    // Helper function to safely get parameters from an algorithm
    const getParametersFromAlgorithm = (algorithm: any): AnalysisParameter[] => {
        if (!algorithm) return [];
        const algorithmWithParams = algorithm as unknown as AlgorithmWithParameters;
        return algorithmWithParams.parameters || [];
    };

    const handleAlgorithmChange = (stepCode: string, algorithmCode: string, algorithmVersion: string) => {
        // Update config with empty parameters
        onConfigChange({
            ...analysisConfig,
            steps: {
                ...analysisConfig.steps,
                [stepCode]: {
                    ...analysisConfig.steps[stepCode],
                    algorithm: {
                        code: algorithmCode,
                        version: algorithmVersion,
                        parameters: {} // Empty parameters by default
                    }
                }
            }
        });
    };

    const handleParameterChange = (stepCode: string, paramName: string, value: any) => {
        onConfigChange({
            ...analysisConfig,
            steps: {
                ...analysisConfig.steps,
                [stepCode]: {
                    ...analysisConfig.steps[stepCode],
                    algorithm: {
                        ...analysisConfig.steps[stepCode].algorithm!,
                        parameters: {
                            ...analysisConfig.steps[stepCode].algorithm!.parameters,
                            [paramName]: {
                                name: paramName,
                                value
                            }
                        }
                    }
                }
            }
        });
    };

    const handleStepToggle = (stepCode: string, enabled: boolean) => {
        onConfigChange({
            ...analysisConfig,
            steps: {
                ...analysisConfig.steps,
                [stepCode]: {
                    ...analysisConfig.steps[stepCode],
                    enabled
                }
            }
        });
    };

    // Function to initialize parameters when user clicks "Customize Parameters"
    const handleInitializeParameters = (stepCode: string) => {
        const algorithmCode = analysisConfig.steps[stepCode]?.algorithm?.code;
        if (!algorithmCode) return;

        const algorithm = getAlgorithmWithParams(stepCode, algorithmCode);
        if (!algorithm) return;

        // Only initialize parameters if they don't exist yet
        if (analysisConfig.steps[stepCode]?.algorithm?.parameters &&
            Object.keys(analysisConfig.steps[stepCode]?.algorithm?.parameters || {}).length > 0) {
            // Parameters already exist, just expand the section
            toggleStepExpansion(stepCode);
            return;
        }

        // Create default parameters
        const defaultParameters: Record<string, any> = {};

        // Set default values for parameters
        getParametersFromAlgorithm(algorithm).forEach(param => {
            defaultParameters[param.name] = {
                name: param.name,
                value: param.default
            };
        });

        // Update config with default parameters
        onConfigChange({
            ...analysisConfig,
            steps: {
                ...analysisConfig.steps,
                [stepCode]: {
                    ...analysisConfig.steps[stepCode],
                    algorithm: {
                        ...analysisConfig.steps[stepCode].algorithm!,
                        parameters: defaultParameters
                    }
                }
            }
        });

        // Expand the parameters section
        setExpandedSteps(prev => ({
            ...prev,
            [stepCode]: true
        }));
    };

    const handleUseDefaultParameters = (stepCode: string) => {
        const algorithmCode = analysisConfig.steps[stepCode]?.algorithm?.code;
        if (!algorithmCode) return;

        const algorithm = getAlgorithmWithParams(stepCode, algorithmCode);
        if (!algorithm) return;

        // Create default parameters
        const defaultParameters: Record<string, any> = {};

        // Set default values for parameters
        getParametersFromAlgorithm(algorithm).forEach(param => {
            defaultParameters[param.name] = {
                name: param.name,
                value: param.default
            };
        });

        // Update config
        onConfigChange({
            ...analysisConfig,
            steps: {
                ...analysisConfig.steps,
                [stepCode]: {
                    ...analysisConfig.steps[stepCode],
                    algorithm: {
                        ...analysisConfig.steps[stepCode].algorithm!,
                        parameters: defaultParameters
                    }
                }
            }
        });

        toast({
            description: "Default parameters applied",
        });
    };

    const toggleStepExpansion = (stepCode: string) => {
        setExpandedSteps(prev => ({
            ...prev,
            [stepCode]: !prev[stepCode]
        }));
    };

    const renderParameterInput = (stepCode: string, param: AnalysisParameter, stepConfig: AnalysisStepConfig) => {
        // Get the value or use default, ensuring it's never null (use empty string or appropriate default)
        const rawValue = stepConfig.algorithm?.parameters?.[param.name]?.value ?? param.default;

        // Convert null/undefined to appropriate defaults based on type
        const value = rawValue === null || rawValue === undefined
            ? (param.type === 'number' ? 0 : param.type === 'boolean' ? false : '')
            : rawValue;

        const labelClasses = "text-sm font-medium text-gray-700 flex items-center";
        const requiredBadge = param.required && (
            <Badge variant="outline" className="ml-2 text-xs py-0 h-5 bg-red-50 text-red-600 border-red-200">
                Required
            </Badge>
        );

        const inputWrapperClasses = "mt-2 relative";

        // Format parameter name for display (convert snake_case to Title Case)
        const formatParamName = (name: string) => {
            return name.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

        switch (param.type) {
            case 'boolean':
                return (
                    <div className="mb-6 p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <Label htmlFor={`${stepCode}-${param.name}`} className={labelClasses}>
                                {formatParamName(param.name)}
                                {requiredBadge}
                            </Label>
                            <Switch
                                id={`${stepCode}-${param.name}`}
                                checked={Boolean(value)}
                                onCheckedChange={(checked) => handleParameterChange(stepCode, param.name, checked)}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                        {param.description && (
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{param.description}</p>
                        )}
                    </div>
                );
            case 'number':
                return (
                    <div className="mb-6">
                        <Label htmlFor={`${stepCode}-${param.name}`} className={labelClasses}>
                            {formatParamName(param.name)}
                            {requiredBadge}
                        </Label>
                        {param.description && (
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{param.description}</p>
                        )}
                        <div className={inputWrapperClasses}>
                            <Input
                                id={`${stepCode}-${param.name}`}
                                type="number"
                                value={value.toString()}
                                onChange={(e) => handleParameterChange(stepCode, param.name, parseFloat(e.target.value) || 0)}
                                className="h-11 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-md shadow-sm"
                                min={param.constraints?.min}
                                max={param.constraints?.max}
                                step={param.constraints?.step || 1}
                            />
                        </div>
                    </div>
                );
            case 'select':
                return (
                    <div className="mb-6">
                        <Label htmlFor={`${stepCode}-${param.name}`} className={labelClasses}>
                            {formatParamName(param.name)}
                            {requiredBadge}
                        </Label>
                        {param.description && (
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{param.description}</p>
                        )}
                        <div className={inputWrapperClasses}>
                            <Select
                                value={value ? value.toString() : ''}
                                onValueChange={(value) => handleParameterChange(stepCode, param.name, value)}
                            >
                                <SelectTrigger id={`${stepCode}-${param.name}`} className="h-11 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-md shadow-sm">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-200 shadow-md rounded-md">
                                    {param.constraints?.options?.map((option: string) => (
                                        <SelectItem key={option} value={option} className="focus:bg-primary/10 focus:text-primary">
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="mb-6">
                        <Label htmlFor={`${stepCode}-${param.name}`} className={labelClasses}>
                            {formatParamName(param.name)}
                            {requiredBadge}
                        </Label>
                        {param.description && (
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{param.description}</p>
                        )}
                        <div className={inputWrapperClasses}>
                            <Input
                                id={`${stepCode}-${param.name}`}
                                type="text"
                                value={value ? value.toString() : ''}
                                onChange={(e) => handleParameterChange(stepCode, param.name, e.target.value)}
                                className="h-11 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-md shadow-sm"
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-8">
            {showHelpTips && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-8">
                    <div className="flex">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-800 mb-1.5">Configuration Tips</h3>
                            <ul className="text-sm text-blue-700 space-y-1.5 list-disc pl-5">
                                <li>Each step can be enabled or disabled using the toggle</li>
                                <li>Select the algorithm you want to use for each step</li>
                                <li>Click "Customize Parameters" to configure advanced settings</li>
                                <li>Use "Default Parameters" to reset to recommended values</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {currentDefinition.steps.map((step, index) => {
                    const stepConfig = analysisConfig.steps[step.code] || {
                        enabled: true,
                        algorithm: undefined
                    };

                    const selectedAlgorithmCode = stepConfig.algorithm?.code;
                    const selectedAlgorithm = selectedAlgorithmCode ?
                        getAlgorithmWithParams(step.code, selectedAlgorithmCode) : null;

                    const fullStepCode = getFullStepCode(step.code);

                    // Check if algorithms are still loading
                    const isLoading = !availableAlgorithms[fullStepCode] && selectedAlgorithmCode;

                    // Get parameters for the selected algorithm
                    const parameters = getParametersFromAlgorithm(selectedAlgorithm);

                    // Check if this step is expanded
                    const isExpanded = expandedSteps[step.code] || false;

                    // Check if parameters have been initialized
                    const hasParameters = stepConfig.algorithm?.parameters &&
                        Object.keys(stepConfig.algorithm.parameters).length > 0;

                    return (
                        <Card
                            key={step.code}
                            className={`transition-all duration-200 border-gray-200 ${!stepConfig.enabled ? 'opacity-70 bg-muted/20' : 'hover:shadow-md'}`}
                        >
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2.5 py-1">
                                            Step {index + 1}
                                        </Badge>
                                        <h3 className="font-medium text-gray-800">
                                            {step.name.split('_').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Label htmlFor={`toggle-${step.code}`} className="text-xs text-gray-500 mr-1.5">
                                            {stepConfig.enabled ? 'Enabled' : 'Disabled'}
                                        </Label>
                                        <Switch
                                            id={`toggle-${step.code}`}
                                            checked={stepConfig.enabled}
                                            onCheckedChange={(checked) => handleStepToggle(step.code, checked)}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            {stepConfig.enabled && (
                                <CardContent className="pt-5">
                                    <div className="space-y-6">
                                        <div>
                                            <Label htmlFor={`algorithm-${step.code}`} className="text-sm font-medium text-gray-700 mb-2 block">
                                                Select Algorithm
                                            </Label>
                                            <Select
                                                value={selectedAlgorithmCode}
                                                onValueChange={(value) => {
                                                    const algorithm = getAlgorithmWithParams(step.code, value);
                                                    if (algorithm) {
                                                        handleAlgorithmChange(step.code, algorithm.code, algorithm.version);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger id={`algorithm-${step.code}`} className="h-11 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-md shadow-sm">
                                                    <SelectValue placeholder="Select algorithm" />
                                                </SelectTrigger>
                                                <SelectContent className="border-gray-200 shadow-md rounded-md">
                                                    {/* Use availableAlgorithms if available, otherwise fall back to step.algorithms */}
                                                    {(availableAlgorithms[fullStepCode] || step.algorithms).map(algorithm => (
                                                        <SelectItem
                                                            key={algorithm.code}
                                                            value={algorithm.code}
                                                            className="focus:bg-primary/10 focus:text-primary"
                                                        >
                                                            {algorithm.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {isLoading ? (
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-10 w-full" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                        ) : selectedAlgorithm && (
                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium text-gray-700">Parameters</h4>
                                                    <div className="flex gap-2">
                                                        {!hasParameters ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleInitializeParameters(step.code)}
                                                                className="text-xs h-8 border-gray-200 hover:bg-gray-50 flex items-center"
                                                            >
                                                                <ChevronDownIcon className="h-3.5 w-3.5 mr-1" />
                                                                Customize Parameters
                                                            </Button>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => toggleStepExpansion(step.code)}
                                                                    className="text-xs h-8 border-gray-200 hover:bg-gray-50 flex items-center"
                                                                >
                                                                    {isExpanded ? (
                                                                        <>
                                                                            <ChevronUpIcon className="h-3.5 w-3.5 mr-1" />
                                                                            Hide Parameters
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ChevronDownIcon className="h-3.5 w-3.5 mr-1" />
                                                                            Show Parameters
                                                                        </>
                                                                    )}
                                                                </Button>
                                                                {isExpanded && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleUseDefaultParameters(step.code)}
                                                                        className="text-xs h-8 border-gray-200 hover:bg-gray-50"
                                                                    >
                                                                        Reset to Defaults
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {hasParameters && isExpanded && parameters.length > 0 && (
                                                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                                        <div className="space-y-1">
                                                            {parameters.map(param => (
                                                                <div key={param.name}>
                                                                    {renderParameterInput(step.code, param, stepConfig)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {hasParameters && isExpanded && parameters.length === 0 && (
                                                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                                        <p className="text-sm text-gray-500">No parameters required for this algorithm.</p>
                                                    </div>
                                                )}

                                                {hasParameters && !isExpanded && parameters.length > 0 && (
                                                    <p className="text-sm text-gray-500 italic">
                                                        This algorithm has {parameters.length} parameter{parameters.length !== 1 ? 's' : ''} that can be customized.
                                                    </p>
                                                )}

                                                {!hasParameters && parameters.length > 0 && (
                                                    <p className="text-sm text-gray-500 italic">
                                                        This algorithm has {parameters.length} parameter{parameters.length !== 1 ? 's' : ''} that can be customized.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
} 