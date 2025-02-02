


/**
 * Parameter definition
 */
export interface Parameter {
    name: string;
    description: string;
    type: string;
    required: boolean;
    default?: any;
    min_value?: number;
    max_value?: number;
    allowed_values?: any[];
}


/**
 * Algorithm interface
 */
export interface Algorithm {
    id: string;
    name: string;
    description?: string;
    version: string;
    supported_document_types: DocumentType[];
    parameters: Parameter[];
    is_active: boolean;
    step_id: string;
    created_at: string;
    updated_at?: string;
}