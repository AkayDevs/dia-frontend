import React from 'react';
import { TableDataOutput } from '@/types/results/table-data-extraction';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface TableDataResultsProps {
    result: TableDataOutput;
}

const TableDataResults: React.FC<TableDataResultsProps> = ({ result }) => {
    return (
        <div className="space-y-4">
            {result.results.map((pageResult, pageIndex) => (
                <Card key={pageIndex}>
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-4">Page {pageResult.page_info.page_number}</h3>
                        {pageResult.tables.map((table, tableIndex) => (
                            <div key={tableIndex} className="mb-6">
                                <h4 className="text-sm text-muted-foreground mb-2">Table {tableIndex + 1}</h4>
                                <div className="border rounded overflow-x-auto">
                                    <Table>
                                        <TableBody>
                                            {table.cells.map((row, rowIndex) => (
                                                <TableRow key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <TableCell key={cellIndex}>
                                                            <div>
                                                                <span>{cell.text}</span>
                                                                {cell.data_type && (
                                                                    <span className="text-xs text-muted-foreground ml-1">
                                                                        ({cell.data_type})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Confidence: {cell.confidence.score.toFixed(2)}
                                                            </div>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default TableDataResults; 