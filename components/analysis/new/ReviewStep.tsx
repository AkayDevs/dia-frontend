import { Badge } from '@/components/ui/badge';
import { Document } from '@/types/document';
import { AnalysisDefinition } from '@/types/analysis/configs';
import { AnalysisRunConfig } from '@/types/analysis/base';
import {
    DocumentTextIcon,
    Cog6ToothIcon,
    PlayIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

// Add formatFileSize function directly to this component
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface ReviewStepProps {
    selectedDocument: Document | null;
    selectedAnalysisType: AnalysisDefinition | null;
    selectedMode: 'automatic' | 'step_by_step' | null;
    analysisConfig: AnalysisRunConfig;
    currentDefinition: AnalysisDefinition | null;
}

export function ReviewStep({
    selectedDocument,
    selectedAnalysisType,
    selectedMode,
    analysisConfig,
    currentDefinition
}: ReviewStepProps) {
    return (
        <div className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Review Configuration</h3>

                {/* Document */}
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Document</h4>
                    <div className="bg-white rounded-md border p-4">
                        {selectedDocument ? (
                            <div className="flex items-start">
                                <DocumentTextIcon className="h-5 w-5 text-primary mr-3 mt-0.5" />
                                <div>
                                    <p className="font-medium">{selectedDocument.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedDocument.metadata?.num_pages || 'Unknown'} pages • {selectedDocument.type} • {formatFileSize(selectedDocument.size)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No document selected</p>
                        )}
                    </div>
                </div>

                {/* Analysis Type */}
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Analysis Type</h4>
                    <div className="bg-white rounded-md border p-4">
                        {selectedAnalysisType ? (
                            <div className="flex items-start">
                                <Cog6ToothIcon className="h-5 w-5 text-primary mr-3 mt-0.5" />
                                <div>
                                    <p className="font-medium">{selectedAnalysisType.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedAnalysisType.description}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No analysis type selected</p>
                        )}
                    </div>
                </div>

                {/* Algorithm Configuration */}
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Algorithm Configuration</h4>
                    <div className="bg-white rounded-md border p-4 space-y-4">
                        {currentDefinition?.steps.map(step => {
                            // Change step.id to step.code
                            const stepConfig = analysisConfig.steps[step.code];
                            if (!stepConfig) return null;

                            const algorithm = step.algorithms.find(
                                algo => algo.code === stepConfig.algorithm?.code
                            );

                            return (
                                // Change step.id to step.code
                                <div key={step.code} className="border-b last:border-b-0 pb-4 last:pb-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <Badge variant={stepConfig.enabled ? "default" : "outline"} className="mr-2">
                                                {stepConfig.enabled ? "Enabled" : "Disabled"}
                                            </Badge>
                                            <h5 className="font-medium">{step.name}</h5>
                                        </div>
                                    </div>

                                    {stepConfig.enabled && (
                                        <div className="pl-4 border-l-2 border-muted space-y-2">
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">Algorithm:</span>{" "}
                                                {algorithm?.name || "None selected"}
                                            </p>

                                            {algorithm && Object.keys(stepConfig.algorithm?.parameters || {}).length > 0 && (
                                                <div className="space-y-1">
                                                    <p className="text-sm text-muted-foreground">Parameters:</p>
                                                    <ul className="text-sm pl-4 space-y-1">
                                                        {Object.entries(stepConfig.algorithm?.parameters || {}).map(([key, param]: [string, any]) => (
                                                            <li key={key}>
                                                                <span className="font-medium">{key}:</span>{" "}
                                                                {param.value !== undefined ? String(param.value) : "Not set"}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mode */}
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Processing Mode</h4>
                    <div className="bg-white rounded-md border p-4">
                        {selectedMode ? (
                            <div className="flex items-start">
                                <PlayIcon className="h-5 w-5 text-primary mr-3 mt-0.5" />
                                <div>
                                    <p className="font-medium">
                                        {selectedMode === 'automatic' ? 'Automatic Processing' : 'Step-by-Step Processing'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedMode === 'automatic'
                                            ? 'The analysis will run automatically without intervention.'
                                            : 'You will control each step of the analysis process.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No mode selected</p>
                        )}
                    </div>
                </div>

                {/* Start Info */}
                <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                        Once you start the analysis, you'll be redirected to the analysis dashboard where you can monitor progress
                        {selectedMode === 'step_by_step' ? ' and control each step of the process.' : '.'}
                    </p>
                </div>
            </div>
        </div>
    );
} 