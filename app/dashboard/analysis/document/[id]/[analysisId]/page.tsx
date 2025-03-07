'use client';

import { useState, useEffect } from 'react';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { AnalysisStepper, AnalysisResults, AnalysisOptions, AnalysisSummary } from '@/components/analysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Analysis content component that uses the Zustand store
function AnalysisContent() {
  const {
    analysisId,
    documentId,
    analysisType,
    isLoading,
    error
  } = useAnalysisStore();

  const [activeTab, setActiveTab] = useState('stepper');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analysis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
        <h3 className="text-lg font-medium">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          {analysisType === 'table_analysis' ? 'Table Analysis' : 'Text Analysis'}
        </h2>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="stepper">Steps</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="stepper" className="mt-6">
            <AnalysisStepper
              analysisType={analysisType}
              analysisId={analysisId}
              documentId={documentId}
            />
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            <AnalysisResults
              analysisType={analysisType}
              analysisId={analysisId}
              documentId={documentId}
            />
          </TabsContent>

          <TabsContent value="options" className="mt-6">
            <AnalysisOptions
              analysisType={analysisType}
              analysisId={analysisId}
              documentId={documentId}
            />
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <AnalysisSummary
              analysisType={analysisType}
              analysisId={analysisId}
              documentId={documentId}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default function AnalysisPage({
  params
}: {
  params: { documentId: string; analysisId: string }
}) {
  const { setAnalysisId, setDocumentId, refreshData } = useAnalysisStore();

  useEffect(() => {
    // Set the IDs in the store
    setAnalysisId(params.analysisId);
    setDocumentId(params.documentId);

    // Fetch the analysis data
    refreshData();
  }, [params.analysisId, params.documentId, setAnalysisId, setDocumentId, refreshData]);

  return (
    <div className="container mx-auto py-8">
      <AnalysisContent />
    </div>
  );
} 