/**
 * Table Analysis Components
 * This file exports all components for table analysis
 */
import { BaseAnalysisComponents } from '../base';
import Results from './Results';
import Edits from './Edits';
import Overview from './Overview';
import Summary from './Summary';
import ExtractStep from './ExtractStep';

// Export the table analysis components
export const TableAnalysisComponents: BaseAnalysisComponents = {
    Results,
    Edits,
    Overview,
    Summary,
    StepComponents: {
        // Map step codes to their specific components
        'extract': ExtractStep,
        // Add more step-specific components as needed
    }
};

// Export individual components for direct imports
export { default as TableResults } from './Results';
export { default as TableEdits } from './Edits';
export { default as TableOverview } from './Overview';
export { default as TableSummary } from './Summary';
export { default as TableExtractStep } from './ExtractStep';
