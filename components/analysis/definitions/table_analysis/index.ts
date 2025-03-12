/**
 * Table Analysis Components
 * This file exports all components for table analysis
 */
import { BaseAnalysisComponents, StepComponentType } from '../base';
import Results from './Results';
import Edits from './Edits';
import Overview from './Overview';
import Summary from './Summary';
import { TableAnalysisStepCode } from '@/enums/analysis';
import TableDetectionVisualizer from './detection/visualizer';
import TableStructureVisualizer from './structure/visualizer';
import TableDataVisualizer from './data/visualizer';
import TableDetectionEditor from './detection/editor';

// Export the table analysis components
export const TableAnalysisComponents: BaseAnalysisComponents = {
    Results,
    Edits,
    Overview,
    Summary,
    StepComponents: {
        // Map step codes to their specific components by component type
        [TableAnalysisStepCode.TABLE_DETECTION]: {
            // Add more component types as they are implemented
            [StepComponentType.VISUALIZER]: TableDetectionVisualizer,
            [StepComponentType.EDITOR]: TableDetectionEditor,
        },
        [TableAnalysisStepCode.TABLE_STRUCTURE]: {
            // Will be implemented later
            [StepComponentType.VISUALIZER]: TableStructureVisualizer,
        },
        [TableAnalysisStepCode.TABLE_DATA]: {
            // Will be implemented later
            [StepComponentType.VISUALIZER]: TableDataVisualizer,
        }
    }
};

// Export individual components for direct imports
export { default as TableResults } from './Results';
export { default as TableEdits } from './Edits';
export { default as TableOverview } from './Overview';
export { default as TableSummary } from './Summary';
