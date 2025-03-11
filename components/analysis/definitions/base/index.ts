/**
 * Base Analysis Components
 * This file defines the common interfaces that all analysis component definitions should follow
 */
import { AnalysisStep } from '@/constants/analysis';
import { StepResultResponse } from '@/types/analysis/base';
// Base interface for analysis results component
export interface BaseResultsProps {
    analysisId: string;
    analysisType: string;
    stepCode: string;
    // Optional parameters for enhanced functionality
    stepResult?: StepResultResponse; // Result from the current step
    documentId?: string; // Associated document ID
    pageNumber?: number; // Page number for the result
    showControls?: boolean; // Whether to show interactive controls
    onExport?: (format: string) => void; // Callback for exporting results
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
    documentId: string;
    analysisType: string;
    step: AnalysisStep;
    stepResult?: StepResultResponse;
}

// Component types for step-specific components
export enum StepComponentType {
    VISUALIZER = 'visualizer',
    EDITOR = 'editor',
    DETAILS = 'details',
    SUMMARY = 'summary',
    CONFIGURATION = 'configuration'
}

// Base interface that all analysis component definitions must implement
export interface BaseAnalysisComponents {
    // Required components
    Results: React.ComponentType<BaseResultsProps>;
    Edits: React.ComponentType<BaseEditsProps>;
    Overview: React.ComponentType<BaseOverviewProps>;
    Summary: React.ComponentType<BaseSummaryProps>;

    // Optional step-specific components
    // Now organized by step code and component type
    StepComponents?: {
        [stepCode: string]: {
            [componentType in StepComponentType]?: React.ComponentType<BaseStepComponentProps>;
        };
    };
}

export { default as BaseResults } from './Results';
export { default as BaseEdits } from './Edits';
export { default as BaseOverview } from './Overview';
export { default as BaseSummary } from './Summary';
export { default as BaseStepComponent } from './StepComponent'; 