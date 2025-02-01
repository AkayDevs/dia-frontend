import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import React from 'react'

export const AnalysisResultsPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
    <div className="flex items-center justify-between">
        <Button
            variant="ghost"
            className="flex items-center gap-2"
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </Button>
    </div>
    </div>
  )
}

export default AnalysisResultsPage;
