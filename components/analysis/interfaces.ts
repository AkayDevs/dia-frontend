import { ReactNode } from 'react';
import { BaseAnalysisRun, BaseAnalysisResult, BaseStep } from '@/types/analysis/base';

/**
 * Base props for all analysis components
 */
export interface BaseAnalysisProps {
    analysisId: string;
    documentId: string;
    className?: string;
}

/**
 * Stepper component props
 */
export interface StepperProps extends BaseAnalysisProps {
    steps?: BaseStep[];
    currentStep?: number;
    onStepChange?: (step: number) => void;
    onComplete?: () => void;
}

/**
 * Results component props
 */
export interface ResultsProps extends BaseAnalysisProps {
    result?: BaseAnalysisResult;
    isLoading?: boolean;
    error?: string;
}

/**
 * Options component props
 */
export interface OptionsProps extends BaseAnalysisProps {
    config?: BaseAnalysisRun;
    onChange?: (config: Partial<BaseAnalysisRun>) => void;
    onSave?: () => void;
}

/**
 * Summary component props
 */
export interface SummaryProps extends BaseAnalysisProps {
    result?: BaseAnalysisResult;
    config?: BaseAnalysisRun;
}

/**
 * Analysis component map interface
 */
export interface AnalysisComponentMap {
    Stepper: React.ComponentType<StepperProps>;
    Results: React.ComponentType<ResultsProps>;
    Options: React.ComponentType<OptionsProps>;
    Summary: React.ComponentType<SummaryProps>;
    [key: string]: React.ComponentType<any>;
} 