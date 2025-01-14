'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Steps } from '@/components/ui/steps';
import { DocumentSelection } from '@/components/analysis/setup/document-selection';
import { AnalysisTypeSelection } from '@/components/analysis/setup/analysis-type-selection';
import { ModeSelection } from '@/components/analysis/setup/mode-selection';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types/document';
import { AnalysisType } from '@/types/analysis';

const steps = [
    { id: 'document', title: 'Document Selection' },
    { id: 'analysis-type', title: 'Analysis Type' },
    { id: 'mode', title: 'Mode Selection' }
];

export default function AnalysisSetupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisType | null>(null);
    const [selectedMode, setSelectedMode] = useState<'automatic' | 'step_by_step' | null>(null);

    const handleNext = () => {
        if (currentStep === steps.length - 1) {
            // Navigate to the appropriate page based on selected mode
            const path = selectedMode === 'automatic'
                ? `/dashboard/analysis/${selectedDocument?.id}/automatic`
                : `/dashboard/analysis/${selectedDocument?.id}/step-by-step`;
            router.push(path);
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

    const isNextDisabled = () => {
        switch (currentStep) {
            case 0:
                return !selectedDocument;
            case 1:
                return !selectedAnalysisType;
            case 2:
                return !selectedMode;
            default:
                return true;
        }
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
                        onSelect={setSelectedAnalysisType}
                    />
                );
            case 2:
                return (
                    <ModeSelection
                        selectedMode={selectedMode}
                        onSelect={setSelectedMode}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-4xl mx-auto">
                <div className="p-6">
                    <h1 className="text-2xl font-semibold mb-6">New Analysis Setup</h1>

                    <Steps
                        steps={steps}
                        currentStep={currentStep}
                        className="mb-8"
                    />

                    <div className="min-h-[400px]">
                        {renderStep()}
                    </div>

                    <div className="flex justify-between mt-8">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                        >
                            {currentStep === 0 ? 'Cancel' : 'Back'}
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={isNextDisabled()}
                        >
                            {currentStep === steps.length - 1 ? 'Start Analysis' : 'Next'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
} 