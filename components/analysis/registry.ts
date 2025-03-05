import { AnalysisDefinitionCode } from '@/types/analysis/registry';
import { AnalysisComponentMap } from './interfaces';

// Import lazy-loaded components
import dynamic from 'next/dynamic';

// Table analysis components
const TableStepper = dynamic(() => import('./types/table/Stepper').then(mod => mod.Stepper));
const TableResults = dynamic(() => import('./types/table/Results').then(mod => mod.Results));
const TableOptions = dynamic(() => import('./types/table/Options').then(mod => mod.Options));
const TableSummary = dynamic(() => import('./types/table/Summary').then(mod => mod.Summary));

// Text analysis components
const TextStepper = dynamic(() => import('./types/text/Stepper').then(mod => mod.Stepper));
const TextResults = dynamic(() => import('./types/text/Results').then(mod => mod.Results));
const TextOptions = dynamic(() => import('./types/text/Options').then(mod => mod.Options));
const TextSummary = dynamic(() => import('./types/text/Summary').then(mod => mod.Summary));

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
        Stepper: TextStepper,
        Results: TextResults,
        Options: TextOptions,
        Summary: TextSummary
    }
    // Add other analysis types as needed
};

/**
 * Get a component for a specific analysis type
 */
export function getAnalysisComponent(analysisType: string, componentName: string) {
    if (!Object.values(AnalysisDefinitionCode).includes(analysisType as AnalysisDefinitionCode)) {
        throw new Error(`Invalid analysis type: ${analysisType}`);
    }

    const componentMap = COMPONENT_REGISTRY[analysisType];

    if (!componentMap) {
        throw new Error(`Component map not found for analysis type: ${analysisType}`);
    }

    const Component = componentMap[componentName];

    if (!Component) {
        throw new Error(`Component "${componentName}" not found for analysis type: ${analysisType}`);
    }

    return Component;
} 