import { ReactNode } from 'react';
import { AnalysisRunInfo, StepResultResponse } from '@/types/analysis/base';

/**
 * Base step interface
 */
export interface BaseStep {
    id: string;
    code: string;
    name: string;
    description?: string;
    order: number;
}

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
    result?: StepResultResponse;
    isLoading?: boolean;
    error?: string;
}

/**
 * Options component props
 */
export interface OptionsProps extends BaseAnalysisProps {
    config?: AnalysisRunInfo;
    onChange?: (config: Partial<AnalysisRunInfo>) => void;
    onSave?: () => void;
}

/**
 * Summary component props
 */
export interface SummaryProps extends BaseAnalysisProps {
    result?: StepResultResponse;
    config?: AnalysisRunInfo;
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