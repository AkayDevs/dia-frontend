import { BaseStepComponentProps } from "@/components/analysis/definitions/base";

const TableStructureEditor : React.FC<BaseStepComponentProps> = ({ step, documentId, analysisId, analysisType, stepResult }) => {

    console.log(stepResult);
    
    return (
        <div>
            <h1>Table Structure Editor</h1>
        </div>
    );
};