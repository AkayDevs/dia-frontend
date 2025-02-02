import React from 'react';
import { TableStructureOutput } from '@/types/results/table-recognition';
import { Card, CardContent } from '@/components/ui/card';

interface TableStructureResultsProps {
    result: TableStructureOutput;
}

const TableStructureResults: React.FC<TableStructureResultsProps> = ({ result }) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.results.map((pageResult, pageIndex) => (
                    <Card key={pageIndex}>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-2">Page {pageResult.page_info.page_number}</h3>
                            {pageResult.tables.map((table, tableIndex) => (
                                <div key={tableIndex} className="border rounded p-2 mb-2">
                                    <p>Rows: {table.num_rows}</p>
                                    <p>Columns: {table.num_cols}</p>
                                    <p>Confidence: {table.confidence.score.toFixed(2)}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TableStructureResults; 