/**
 * Base Analysis Components
 * This file defines the common interfaces that all analysis component definitions should follow
 */
import { AnalysisStep } from '@/constants/analysis';

// Base interface for analysis results component
export interface BaseResultsProps {
    analysisId: string;
    analysisType: string;
    stepCode: string;
}

// Base interface for analysis edits component
export interface BaseEditsProps {
    analysisId: string;
    analysisType: string;
    stepCode: string;
}

// Base interface for analysis overview component
export interface BaseOverviewProps {
    analysisId: string;
    analysisType: string;
}

// Base interface for analysis summary component
export interface BaseSummaryProps {
    analysisId: string;
    analysisType: string;
    stepCode: string;
    // Optional parameters for enhanced functionality
    stepResults?: any; // Results from the current step
    allStepResults?: Record<string, any>; // Results from all steps
    documentId?: string; // Associated document ID
    status?: string; // Analysis status
    createdAt?: string; // Creation timestamp
    completedAt?: string; // Completion timestamp
    metadata?: Record<string, any>; // Any additional metadata
}

// Base interface for step-specific components
export interface BaseStepComponentProps {
    analysisId: string;
    analysisType: string;
    step: AnalysisStep;
}

// Base interface that all analysis component definitions must implement
export interface BaseAnalysisComponents {
    // Required components
    Results: React.ComponentType<BaseResultsProps>;
    Edits: React.ComponentType<BaseEditsProps>;
    Overview: React.ComponentType<BaseOverviewProps>;
    Summary: React.ComponentType<BaseSummaryProps>;

    // Optional step-specific components
    StepComponents?: {
        [stepCode: string]: React.ComponentType<BaseStepComponentProps>;
    };
}

export { default as BaseResults } from './Results';
export { default as BaseEdits } from './Edits';
export { default as BaseOverview } from './Overview';
export { default as BaseSummary } from './Summary';
export { default as BaseStepComponent } from './StepComponent'; 