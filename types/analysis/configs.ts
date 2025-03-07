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
    id: string;
    code: string;
    name: string;
    version: string;
    description: string;
    order: number;
    is_active: boolean;
    base_parameters: AnalysisParameter[];
}

export interface AnalysisStep extends AnalysisStepInfo {
    algorithms: AnalysisAlgorithmInfo[];
}

export interface AnalysisStepWithResults extends AnalysisStepInfo {
    // results: AnalysisStepResult[];
}

export interface AnalysisAlgorithmInfo {
    id: string;
    code: string;
    name: string;
    version: string;
    description: string;
    supported_document_types: DocumentType[];
    is_active: boolean;
    parameters: AnalysisParameter[];
}

export interface AnalysisAlgorithm extends AnalysisAlgorithmInfo {
    // results: AnalysisAlgorithmResult[];
}


export interface AnalysisParameter {
    name: string;
    type: string;
    description: string;
    required: boolean;
    default: any;
    constraints: any;
}