'use client';

import { useState, useEffect } from 'react';
import { ResultsProps } from '../../interfaces';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { TableAnalysisResult } from '@/types/analysis/types/table';
import { AnalysisStatus } from '@/types/analysis/base';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Download, Table, FileSpreadsheet, FileJson } from 'lucide-react';
import { ANALYSIS_STATUS_LABELS, ANALYSIS_STATUS_COLORS } from '@/constants/analysis';

export function Results({ analysisId, documentId, result: initialResult, isLoading: initialLoading, error: initialError }: ResultsProps) {
  const { getAnalysisResult } = useAnalysisStore();
  const [result, setResult] = useState<TableAnalysisResult | null>(initialResult as TableAnalysisResult || null);
  const [isLoading, setIsLoading] = useState(initialLoading || true);
  const [error, setError] = useState<string | null>(initialError || null);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  
  useEffect(() => {
    if (initialResult) {
      setResult(initialResult as TableAnalysisResult);
      setIsLoading(false);
      return;
    }
    
    const fetchResult = async () => {
      setIsLoading(true);
      try {
        const resultData = await getAnalysisResult(analysisId);
        setResult(resultData as TableAnalysisResult);
        
        if (resultData?.tables?.length > 0) {
          setActiveTable(resultData.tables[0].id);
        }
        
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load analysis results');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResult();
  }, [analysisId, getAnalysisResult, initialResult]);
  
  const getStatusBadge = (status: AnalysisStatus) => {
    const label = ANALYSIS_STATUS_LABELS[status] || status;
    const colorClass = ANALYSIS_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {label}
      </span>
    );
  };
  
  const renderTableData = (tableId: string) => {
    const table = result?.tables.find(t => t.id === tableId);
    
    if (!table) {
      return (
        <div className="p-4 text-muted-foreground">
          <p>Table not found.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {table.headerRow ? (
                table.headerRow.map((header, i) => (
                  <th 
                    key={i}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))
              ) : (
                Array.from({ length: table.columnCount }).map((_, i) => (
                  <th 
                    key={i}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Column {i + 1}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-destructive">
        <AlertCircle className="h-5 w-5 mb-2" />
        <p>{error}</p>
      </div>
    );
  }
  
  if (!result || !result.tables || result.tables.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Table className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Tables Found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              No tables were detected in this document or the analysis is still in progress.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Table Analysis Results</h2>
          <p className="text-sm text-muted-foreground">
            {result.tables.length} table{result.tables.length !== 1 ? 's' : ''} detected
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(result.status)}
          <div className="flex space-x-1">
            <Button size="sm" variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Excel
            </Button>
            <Button size="sm" variant="outline">
              <FileJson className="h-4 w-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-0">
          <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(result.tables.length, 5)}, 1fr)` }}>
            {result.tables.map((table, index) => (
              <TabsTrigger 
                key={table.id} 
                value={table.id}
                onClick={() => setActiveTable(table.id)}
              >
                Table {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <Tabs value={activeTable || ''} className="w-full">
            {result.tables.map(table => (
              <TabsContent key={table.id} value={table.id} className="m-0">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">
                        {table.name || `Table ${result.tables.findIndex(t => t.id === table.id) + 1}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Page {table.pageNumber} • {table.rowCount} rows × {table.columnCount} columns
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                  
                  {renderTableData(table.id)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 