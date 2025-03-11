/**
 * Analysis Components Registry
 * This file provides a registry for all analysis components and utility functions to access them
 */
import { AnalysisDefinitionCode } from '../../constants/analysis/registry';
import {
    BaseAnalysisComponents,
    BaseResults,
    BaseEdits,
    BaseOverview,
    BaseSummary,
    BaseStepComponent,
    BaseStepComponentProps,
    StepComponentType
} from './definitions/base';
import { TableAnalysisComponents } from './definitions/table_analysis';

// Import other analysis components as they are created
// import { TextAnalysisComponents } from './definitions/text_analysis';

// Type for the analysis components map
type AnalysisComponentsMap = {
    [AnalysisDefinitionCode.TABLE_ANALYSIS]: BaseAnalysisComponents;
    [AnalysisDefinitionCode.TEXT_ANALYSIS]?: BaseAnalysisComponents;
};

/**
 * Analysis components registry
 * Maps analysis type codes to their components
 */
export const ANALYSIS_COMPONENTS_REGISTRY: AnalysisComponentsMap = {
    [AnalysisDefinitionCode.TABLE_ANALYSIS]: TableAnalysisComponents,

    // Add other analysis components as they are created
    // [AnalysisDefinitionCode.TEXT_ANALYSIS]: TextAnalysisComponents,
};

/**
 * Get components for a specific analysis type
 */
export function getAnalysisComponents(analysisType: string): BaseAnalysisComponents {
    // If analysisType is empty or undefined, default to TABLE_ANALYSIS
    if (!analysisType) {
        return ANALYSIS_COMPONENTS_REGISTRY[AnalysisDefinitionCode.TABLE_ANALYSIS];
    }

    if (!Object.values(AnalysisDefinitionCode).includes(analysisType as AnalysisDefinitionCode)) {
        throw new Error(`Invalid analysis type: ${analysisType}`);
    }

    const components = ANALYSIS_COMPONENTS_REGISTRY[analysisType as keyof typeof ANALYSIS_COMPONENTS_REGISTRY];

    if (!components) {
        // Return default components if specific ones are not found
        return {
            Results: BaseResults,
            Edits: BaseEdits,
            Overview: BaseOverview,
            Summary: BaseSummary
        };
    }

    return components;
}

/**
 * Get the Results component for a specific analysis type
 */
export function getResultsComponent(analysisType: string) {
    const components = getAnalysisComponents(analysisType);
    return components.Results;
}

/**
 * Get the Edits component for a specific analysis type
 */
export function getEditsComponent(analysisType: string) {
    const components = getAnalysisComponents(analysisType);
    return components.Edits;
}

/**
 * Get the Overview component for a specific analysis type
 */
export function getOverviewComponent(analysisType: string) {
    const components = getAnalysisComponents(analysisType);
    return components.Overview;
}

/**
 * Get the Summary component for a specific analysis type
 */
export function getSummaryComponent(analysisType: string) {
    const components = getAnalysisComponents(analysisType);
    return components.Summary;
}

/**
 * Get a step-specific component for a specific analysis type, step code, and component type
 */
export function getStepComponent(
    analysisType: string,
    stepCode: string,
    componentType: StepComponentType = StepComponentType.VISUALIZER
) {
    const components = getAnalysisComponents(analysisType);

    if (
        components.StepComponents &&
        components.StepComponents[stepCode] &&
        components.StepComponents[stepCode][componentType]
    ) {
        return components.StepComponents[stepCode][componentType];
    }

    // Return default step component if specific one is not found
    return BaseStepComponent;
}
