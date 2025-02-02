import { AnalysisType, AnalysisStep, AnalysisStepResult } from '@/types/analysis';
import { TableAnalysisStepEnum, TextAnalysisStepEnum, TemplateConversionStepEnum } from '@/lib/enums';

type StepType = TableAnalysisStepEnum | TextAnalysisStepEnum | TemplateConversionStepEnum;

/**
 * Find step type from step_id using analysis type information
 */
export const findStepType = (
    stepId: string,
    analysisType: AnalysisType | null
): StepType | null => {
    if (!analysisType) return null;

    const step = analysisType.steps.find(step => step.id === stepId);
    return step?.name || null;
};

/**
 * Find step from step_id using analysis type information
 */
export const findStep = (
    stepId: string,
    analysisType: AnalysisType | null
): AnalysisStep | null => {
    if (!analysisType) return null;

    return analysisType.steps.find(step => step.id === stepId) || null;
}; 