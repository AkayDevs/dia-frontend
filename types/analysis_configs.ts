import { DocumentType } from './document';

/**
 * Algorithm parameter interface
 */
export interface AlgorithmParameter {
    name: string;
    type: string;
    description?: string;
    required: boolean;
    default?: any;
    constraints?: Record<string, any>;
}

/**
 * Algorithm parameter value interface
 */
export interface AlgorithmParameterValue {
    name: string;
    value: any;
}

/**
 * Base algorithm definition interface
 */
export interface AlgorithmDefinitionBase {
    code: string;
    name: string;
    version: string;
    description?: string;
    supported_document_types: DocumentType[];
    parameters: AlgorithmParameter[];
    implementation_path: string;
    is_active: boolean;
}

/**
 * Algorithm definition info interface
 */
export interface AlgorithmDefinitionInfo {
    id: string;
    code: string;
    name: string;
    version: string;
    description?: string;
    is_active: boolean;
}

/**
 * Algorithm selection interface
 */
export interface AlgorithmSelection {
    code: string;
    version: string;
    parameters?: AlgorithmParameterValue[];
}

/**
 * Base step definition interface
 */
export interface StepDefinitionBase {
    code: string;
    name: string;
    version: string;
    description?: string;
    order: number;
    base_parameters: AlgorithmParameter[];
    result_schema_path: string;
    implementation_path: string;
    is_active: boolean;
}

/**
 * Step definition info interface
 */
export interface StepDefinitionInfo {
    id: string;
    code: string;
    name: string;
    version: string;
    description?: string;
    order: number;
    is_active: boolean;
}

/**
 * Step definition with algorithms interface
 */
export interface StepDefinitionWithAlgorithms extends StepDefinitionInfo {
    algorithms: AlgorithmDefinitionInfo[];
}

/**
 * Base analysis definition interface
 */
export interface AnalysisDefinitionBase {
    code: string;
    name: string;
    version: string;
    description?: string;
    supported_document_types: DocumentType[];
    implementation_path: string;
    is_active: boolean;
}

/**
 * Analysis definition info interface
 */
export interface AnalysisDefinitionInfo {
    id: string;
    code: string;
    name: string;
    version: string;
    description?: string;
    supported_document_types: DocumentType[];
    is_active: boolean;
}

/**
 * Analysis definition with steps interface
 */
export interface AnalysisDefinitionWithSteps extends AnalysisDefinitionInfo {
    steps: StepDefinitionInfo[];
}

/**
 * Analysis definition with steps and algorithms interface
 */
export interface AnalysisDefinitionWithStepsAndAlgorithms extends AnalysisDefinitionWithSteps {
    steps: StepDefinitionWithAlgorithms[];
}

/**
 * Analysis run configuration interface
 */
export interface AnalysisRunConfig {
    steps?: Record<string, AlgorithmSelection>;
    notifications?: Record<string, any>;
    metadata?: Record<string, any>;
}

/**
 * Analysis execution modes
 */
export enum AnalysisMode {
    AUTOMATIC = 'automatic',
    STEP_BY_STEP = 'step_by_step'
}

/**
 * Analysis processing types
 */
export enum AnalysisProcessingType {
    SINGLE = 'single',
    BATCH = 'batch'
}

/**
 * Analysis status
 */
export enum AnalysisStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed'
}