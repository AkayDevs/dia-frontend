/**
 * Base Analysis Definition
 * This file defines the common structure and interfaces that all analysis definitions should follow
 */

// Common interfaces
export interface AnalysisDefinitionName {
    name: string;
}

export interface AnalysisStep {
    step_code: string;
    name: string;
    description: string;
    order: number;
}

export interface AnalysisDefinitionIcon {
    icon: string;
}

export interface ErrorMessages {
    [key: string]: string;
}

export interface SuccessMessages {
    [key: string]: string;
}

// Base interface that all analysis definitions must implement
export interface BaseAnalysisDefinition {
    // Required properties
    ANALYSIS_DEFINITION_NAME: AnalysisDefinitionName;
    ANALYSIS_STEPS: AnalysisStep[];
    ANALYSIS_DEFINITION_ICON: AnalysisDefinitionIcon;
    ERROR_MESSAGES: ErrorMessages;
    SUCCESS_MESSAGES: SuccessMessages;
}

// Common utility functions
export function createAnalysisStep(
    step_code: string,
    name: string,
    description: string,
    order: number
): AnalysisStep {
    return {
        step_code,
        name,
        description,
        order
    };
} 