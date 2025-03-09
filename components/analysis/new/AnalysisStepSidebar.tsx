import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import {
    CheckCircleIcon,
    PlayIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    LightBulbIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

// Define the icon mapping
const iconMap = {
    'DocumentText': DocumentTextIcon,
    'Cog6Tooth': Cog6ToothIcon,
    'LightBulb': LightBulbIcon,
    'Play': PlayIcon,
    'CheckCircle': CheckIcon
};

interface Step {
    id: string;
    title: string;
    icon: string;
    description: string;
}

interface AnalysisStepSidebarProps {
    steps: Step[];
    activeStep: string;
    completedSteps: Record<string, boolean>;
    canNavigateTo: (stepId: string) => boolean;
    onStepChange: (stepId: string) => void;
    onStartAnalysis: () => void;
    isStartDisabled: boolean;
    isSubmitting: boolean;
}

export function AnalysisStepSidebar({
    steps,
    activeStep,
    completedSteps,
    canNavigateTo,
    onStepChange,
    onStartAnalysis,
    isStartDisabled,
    isSubmitting
}: AnalysisStepSidebarProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 sticky top-8">
            <h2 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
                <span className="h-5 w-1.5 bg-primary rounded-full mr-3"></span>
                Analysis Setup
            </h2>
            <nav className="space-y-3">
                {steps.map((step, index) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = completedSteps[step.id];
                    const canNavigate = canNavigateTo(step.id);
                    const Icon = iconMap[step.icon as keyof typeof iconMap];

                    return (
                        <button
                            key={step.id}
                            onClick={() => onStepChange(step.id)}
                            disabled={!canNavigate && !isActive}
                            className={`w-full flex items-start p-4 rounded-lg text-left transition-all ${isActive
                                    ? 'bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary'
                                    : isCompleted
                                        ? 'hover:bg-gray-50 border-l-4 border-green-500'
                                        : canNavigate
                                            ? 'hover:bg-gray-50 border-l-4 border-transparent'
                                            : 'opacity-50 cursor-not-allowed border-l-4 border-transparent'
                                }`}
                        >
                            <div className={`flex items-center justify-center h-9 w-9 rounded-full mr-4 flex-shrink-0 shadow-sm ${isActive
                                    ? 'bg-gradient-to-br from-primary to-primary/90 text-white'
                                    : isCompleted
                                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                                        : 'bg-gray-100 text-gray-500'
                                }`}>
                                {isCompleted && !isActive ? (
                                    <CheckCircleIcon className="h-5 w-5" />
                                ) : Icon ? (
                                    <Icon className="h-5 w-5" />
                                ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                )}
                            </div>
                            <div>
                                <span className={`font-medium block text-base ${isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-gray-800'
                                    }`}>
                                    {step.title}
                                </span>
                                <span className="text-xs text-gray-500 mt-1 block leading-relaxed">
                                    {step.description}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </nav>

            {activeStep === 'review' && (
                <div className="mt-10">
                    <Button
                        onClick={onStartAnalysis}
                        disabled={isStartDisabled || isSubmitting}
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-sm transition-all duration-200 hover:shadow py-6 h-auto"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                <span className="font-medium">Processing...</span>
                            </>
                        ) : (
                            <>
                                <PlayIcon className="h-5 w-5 mr-2" />
                                <span className="font-medium">Start Analysis</span>
                            </>
                        )}
                    </Button>

                    {isStartDisabled && (
                        <p className="text-xs text-center text-gray-500 mt-3">
                            Complete all required steps to start analysis
                        </p>
                    )}
                </div>
            )}
        </div>
    );
} 