'use client';

import { useState, useEffect } from 'react';
import { StepperProps } from '../../interfaces';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { getAnalysisSteps } from '@/constants/analysis/registry';
import { AnalysisTypeCode } from '@/types/analysis/registry';
import { StepStatus } from '@/types/analysis/base';
import { TableAnalysisConfig } from '@/types/analysis/types/table';
import { TABLE_ANALYSIS_ERROR_MESSAGES, TABLE_ANALYSIS_SUCCESS_MESSAGES } from '@/constants/analysis/types/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export function Stepper({ analysisId, documentId, currentStep = 0, onStepChange, onComplete }: StepperProps) {
  const { getAnalysis, updateAnalysis } = useAnalysisStore();
  const [analysis, setAnalysis] = useState<TableAnalysisConfig | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [activeStep, setActiveStep] = useState(currentStep);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const analysisData = await getAnalysis(analysisId);
        setAnalysis(analysisData as TableAnalysisConfig);
        
        // Get steps for table analysis
        const tableSteps = getAnalysisSteps(AnalysisTypeCode.TABLE_DETECTION);
        setSteps(tableSteps);
        
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load analysis data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [analysisId, getAnalysis]);
  
  const handleStepChange = (stepIndex: number) => {
    setActiveStep(stepIndex);
    if (onStepChange) {
      onStepChange(stepIndex);
    }
  };
  
  const handleNextStep = () => {
    if (activeStep < steps.length - 1) {
      handleStepChange(activeStep + 1);
    } else if (onComplete) {
      onComplete();
    }
  };
  
  const getStepStatusIcon = (status: StepStatus) => {
    switch (status) {
      case StepStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case StepStatus.FAILED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case StepStatus.IN_PROGRESS:
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case StepStatus.PENDING:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-destructive">
        <AlertCircle className="h-5 w-5 mb-2" />
        <p>{error}</p>
      </div>
    );
  }
  
  if (!analysis || !steps.length) {
    return (
      <div className="p-4 text-muted-foreground">
        <p>No steps available for this analysis.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Table Analysis Steps</h2>
        <p className="text-sm text-muted-foreground">
          Follow these steps to analyze tables in your document.
        </p>
      </div>
      
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div 
              className={`flex flex-col items-center ${index <= activeStep ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => handleStepChange(index)}
            >
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2
                ${index === activeStep ? 'border-primary bg-primary/10' : 
                  index < activeStep ? 'border-primary' : 'border-muted'}
              `}>
                {index + 1}
              </div>
              <span className="text-xs mt-1">{step.name}</span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-1 ${index < activeStep ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>
      
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{steps[activeStep]?.name}</h3>
          <p className="text-sm text-muted-foreground">{steps[activeStep]?.description}</p>
          
          {/* Step-specific content would go here */}
          <div className="py-4">
            {activeStep === 0 && (
              <p>Table detection settings and controls would go here.</p>
            )}
            {activeStep === 1 && (
              <p>Table extraction settings and controls would go here.</p>
            )}
            {activeStep === 2 && (
              <p>Table validation settings and controls would go here.</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              disabled={activeStep === 0}
              onClick={() => handleStepChange(activeStep - 1)}
            >
              Previous
            </Button>
            <Button onClick={handleNextStep}>
              {activeStep < steps.length - 1 ? (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                'Complete'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 