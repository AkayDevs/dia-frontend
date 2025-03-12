import { DocumentType } from '@/enums/document';

/**
 * Analysis definition
 * This is the definition of an analysis
 */
export interface AnalysisDefinitionInfo {
    id: string;
    code: string;
    name: string;
    version: string;
    description: string;
    supported_document_types: DocumentType[];
    is_active: boolean;
}

export interface AnalysisDefinition extends AnalysisDefinitionInfo {
    steps: AnalysisStep[];
}

export interface AnalysisStepInfo {
    code: string;
    name: string;
    version: string;
    description: string;
    base_parameters: AnalysisParameter[];
    order: number;
    is_active: boolean;
}

export interface AnalysisStep extends AnalysisStepInfo {
    algorithms: AnalysisAlgorithmInfo[];
}

export interface AnalysisStepWithResults extends AnalysisStepInfo {
    // results: AnalysisStepResult[];
}

export interface AnalysisAlgorithmInfo {
    code: string;
    name: string;
    version: string;
    description: string;
    supported_document_types: DocumentType[];
    is_active: boolean;
}

export interface AnalysisAlgorithm extends AnalysisAlgorithmInfo {
    // results: AnalysisAlgorithmResult[];
    parameters: AnalysisParameter[];
}


export interface AnalysisParameter {
    name: string;
    type: string;
    description: string;
    required: boolean;
    default: any;
    constraints: any;
}