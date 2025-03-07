import { AnalysisDefinitionCode } from '@/enums/analysis';
import { AnalysisComponentMap } from './interfaces';
import dynamic from 'next/dynamic';
import React from 'react';

// Import lazy-loaded components
// Table analysis components
const TableStepper = dynamic(() => import('./definitions/table_analysis/Stepper').then(mod => mod.Stepper));
const TableResults = dynamic(() => import('./definitions/table_analysis/Results').then(mod => mod.Results));
const TableOptions = dynamic(() => import('./definitions/table_analysis/Options').then(mod => mod.Options));
const TableSummary = dynamic(() => import('./definitions/table_analysis/Summary').then(mod => mod.Summary));

// Text analysis components will be implemented later
const PlaceholderComponent = dynamic(() =>
    Promise.resolve(() => React.createElement('div', {}, 'Coming soon'))
);

/**
 * Component registry
 * Maps analysis type codes to their component implementations
 */
export const COMPONENT_REGISTRY: Record<string, AnalysisComponentMap> = {
    [AnalysisDefinitionCode.TABLE_ANALYSIS]: {
        Stepper: TableStepper,
        Results: TableResults,
        Options: TableOptions,
        Summary: TableSummary
    },
    [AnalysisDefinitionCode.TEXT_ANALYSIS]: {
        // Placeholder components until text analysis is implemented
        Stepper: PlaceholderComponent as any,
        Results: PlaceholderComponent as any,
        Options: PlaceholderComponent as any,
        Summary: PlaceholderComponent as any
    }
    // Add other analysis types as needed
};

/**
 * Get a component for a specific analysis type
 */
export function getAnalysisComponent(analysisType: string, componentName: string) {
    // Check if the analysis type exists in the registry
    if (!COMPONENT_REGISTRY[analysisType]) {
        console.warn(`Analysis type not found in registry: ${analysisType}`);
        return PlaceholderComponent;
    }

    // Check if the component exists for this analysis type
    const component = COMPONENT_REGISTRY[analysisType][componentName as keyof AnalysisComponentMap];
    if (!component) {
        console.warn(`Component ${componentName} not found for analysis type: ${analysisType}`);
        return PlaceholderComponent;
    }

    return component;
} 