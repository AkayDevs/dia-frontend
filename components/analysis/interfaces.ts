import { ReactNode, ComponentType } from 'react';
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
export interface AnalysisBaseProps {
    analysisId: string;
    documentId: string;
}

/**
 * Stepper component props
 */
export interface StepperProps extends AnalysisBaseProps {
    steps?: BaseStep[];
    currentStep?: number;
    onStepChange?: (step: number) => void;
    onComplete?: () => void;
    onStepComplete?: (stepId: string) => void;
    onAnalysisComplete?: () => void;
}

/**
 * Results component props
 */
export interface ResultsProps extends AnalysisBaseProps {
    result?: StepResultResponse;
    isLoading?: boolean;
    error?: string;
    onExport?: (format: string) => void;
}

/**
 * Options component props
 */
export interface OptionsProps extends AnalysisBaseProps {
    config?: AnalysisRunInfo;
    onChange?: (config: Partial<AnalysisRunInfo>) => void;
    onSave?: (options: any) => void;
}

/**
 * Summary component props
 */
export interface SummaryProps extends AnalysisBaseProps {
    result?: StepResultResponse;
    config?: AnalysisRunInfo;
    onRefresh?: () => void;
}

/**
 * Analysis component map interface
 */
export interface AnalysisComponentMap {
    Stepper: ComponentType<StepperProps>;
    Results: ComponentType<ResultsProps>;
    Options: ComponentType<OptionsProps>;
    Summary: ComponentType<SummaryProps>;
    [key: string]: ComponentType<any>;
} 