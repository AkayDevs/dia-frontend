import React from 'react';
import { getResultsComponent, getEditsComponent, getOverviewComponent, getSummaryComponent, getStepComponent } from '../registry';
import { AnalysisDefinitionCode } from '../../../constants/analysis/registry';
import { getAnalysisSteps } from '../../../constants/analysis/registry';

interface AnalysisResultsExampleProps {
    analysisId: string;
    analysisType: string;
    stepCode: string;
}

/**
 * Example component that demonstrates how to use the analysis components registry
 */
const AnalysisResultsExample: React.FC<AnalysisResultsExampleProps> = ({
    analysisId,
    analysisType,
    stepCode
}) => {
    // Get the appropriate components based on the analysis type
    const ResultsComponent = getResultsComponent(analysisType);
    const EditsComponent = getEditsComponent(analysisType);
    const OverviewComponent = getOverviewComponent(analysisType);
    const SummaryComponent = getSummaryComponent(analysisType);

    // Get step-specific component if available
    const steps = getAnalysisSteps(analysisType);
    const currentStep = steps.find(step => step.step_code === stepCode);
    const StepComponent = currentStep ? getStepComponent(analysisType, stepCode) : null;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Analysis Results</h1>

            {/* Overview Component */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <OverviewComponent analysisId={analysisId} analysisType={analysisType} />
            </section>

            {/* Step-specific Component */}
            {StepComponent && currentStep && (
                <section>
                    <h2 className="text-xl font-semibold mb-4">Step: {currentStep.name}</h2>
                    <StepComponent
                        analysisId={analysisId}
                        analysisType={analysisType}
                        step={currentStep}
                    />
                </section>
            )}

            {/* Results Component */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Results</h2>
                <ResultsComponent
                    analysisId={analysisId}
                    analysisType={analysisType}
                    stepCode={stepCode}
                />
            </section>

            {/* Edits Component */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Edits</h2>
                <EditsComponent
                    analysisId={analysisId}
                    analysisType={analysisType}
                    stepCode={stepCode}
                />
            </section>

            {/* Summary Component */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Summary</h2>
                <SummaryComponent
                    analysisId={analysisId}
                    analysisType={analysisType}
                    stepCode={stepCode}
                    // Additional parameters for enhanced functionality
                    documentId="doc-12345"
                    status="completed"
                    createdAt={new Date(Date.now() - 105000).toISOString()} // 1m 45s ago
                    completedAt={new Date().toISOString()}
                    metadata={{
                        documentName: "Invoice-2023-Q4.pdf",
                        documentType: "PDF",
                        pageCount: 3
                    }}
                    stepResults={{
                        confidence: 92,
                        rowCount: 24,
                        columnCount: 8
                    }}
                    allStepResults={{
                        "extract": {
                            name: "Extract Tables",
                            status: "completed",
                            description: "Extract tables from document",
                            metrics: {
                                confidence: 95,
                                tables: 1,
                                pages: 3
                            }
                        },
                        "process": {
                            name: "Process Tables",
                            status: "completed",
                            description: "Process and structure extracted tables",
                            metrics: {
                                confidence: 92,
                                rows: 24,
                                columns: 8
                            }
                        },
                        "validate": {
                            name: "Validate Data",
                            status: "completed",
                            description: "Validate extracted table data",
                            metrics: {
                                confidence: 90,
                                issues: 2,
                                warnings: 1
                            }
                        }
                    }}
                />
            </section>
        </div>
    );
};

export default AnalysisResultsExample;

// Example usage in a page component:
/*
import AnalysisResultsExample from '../components/analysis/examples/AnalysisResultsExample';
import { AnalysisDefinitionCode } from '../constants/analysis/registry';

const AnalysisResultsPage = () => {
  const analysisId = '123456';
  const analysisType = AnalysisDefinitionCode.TABLE_ANALYSIS;
  const stepCode = 'extract';

  return (
    <div className="container mx-auto p-4">
      <AnalysisResultsExample 
        analysisId={analysisId}
        analysisType={analysisType}
        stepCode={stepCode}
      />
    </div>
  );
};
*/ 