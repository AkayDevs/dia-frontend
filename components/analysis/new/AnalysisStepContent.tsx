import { ReactNode } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    PlayIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    LightBulbIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

// Define the icon mapping
const iconMap = {
    'DocumentText': DocumentTextIcon,
    'Cog6Tooth': Cog6ToothIcon,
    'LightBulb': LightBulbIcon,
    'Play': PlayIcon,
    'CheckCircle': CheckCircleIcon
};

interface Step {
    id: string;
    title: string;
    icon: string;
    description: string;
}

interface AnalysisStepContentProps {
    steps: Step[];
    activeStep: string;
    completedSteps: Record<string, boolean>;
    onNext: () => void;
    onBack: () => void;
    onStartAnalysis: () => void;
    isStartDisabled: boolean;
    isSubmitting: boolean;
    children: ReactNode;
}

export function AnalysisStepContent({
    steps,
    activeStep,
    completedSteps,
    onNext,
    onBack,
    onStartAnalysis,
    isStartDisabled,
    isSubmitting,
    children
}: AnalysisStepContentProps) {
    const currentStep = steps.find(step => step.id === activeStep);
    const IconComponent = currentStep ? iconMap[currentStep.icon as keyof typeof iconMap] : null;

    return (
        <Card className="shadow-sm border border-gray-200/80 overflow-hidden rounded-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b px-8 py-6">
                <div className="flex items-center">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-5 shadow-sm ${activeStep === 'review'
                            ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-600'
                            : 'bg-gradient-to-br from-primary/5 to-primary/15 text-primary'
                        }`}>
                        {IconComponent && <IconComponent className="h-6 w-6" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                            {currentStep?.title}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {currentStep?.description}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8">
                <div className="min-h-[500px]">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </CardContent>

            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t">
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={onBack}
                        className="flex items-center hover:bg-gray-50 transition-colors border-gray-200 px-5 h-11"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        {activeStep === 'document' ? 'Cancel' : 'Back'}
                    </Button>

                    {activeStep !== 'review' ? (
                        <Button
                            onClick={onNext}
                            disabled={!completedSteps[activeStep]}
                            className={`flex items-center transition-all duration-200 px-5 h-11 ${completedSteps[activeStep]
                                    ? 'bg-primary hover:bg-primary/90 shadow-sm hover:shadow'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            <span className="mr-2">Next</span>
                            <ArrowRightIcon className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={onStartAnalysis}
                            disabled={isStartDisabled || isSubmitting}
                            className="flex items-center bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-sm transition-all duration-200 hover:shadow px-5 h-11"
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
                    )}
                </div>
            </div>
        </Card>
    );
} 