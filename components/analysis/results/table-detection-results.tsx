import React, { useState } from 'react';
import { TableDetectionOutput } from '@/types/results/table-detection';
import { Card, CardContent } from '@/components/ui/card';
import { BoundingBox, BoundingBoxUtils } from '@/types/results/shared';

interface TableDetectionResultsProps {
    result: TableDetectionOutput;
    pageUrls: string[];
}

const TableDetectionResults: React.FC<TableDetectionResultsProps> = ({ result, pageUrls }) => {
    const [selectedTable, setSelectedTable] = useState<number | null>(null);

    return (
        <div className="space-y-4">
            {result.results.map((pageResult, pageIndex) => (
                <Card key={pageIndex}>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Left column: Document page with bounding boxes */}
                            <div className="flex-1 relative">
                                <div className="relative" style={{ width: '100%', paddingBottom: '141.4%' }}>
                                    <img
                                        src={pageUrls[pageResult.page_info.page_number - 1]}
                                        alt={`Page ${pageResult.page_info.page_number}`}
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                    {pageResult.tables.map((table, tableIndex) => {
                                        const displayBox = BoundingBoxUtils.toDisplayFormat(table.bbox);
                                        const percentageBox = BoundingBoxUtils.toPercentages(table.bbox, pageResult.page_info);

                                        return (
                                            <div
                                                key={tableIndex}
                                                onClick={() => setSelectedTable(tableIndex)}
                                                style={{
                                                    position: 'absolute',
                                                    left: `${percentageBox.x1}%`,
                                                    top: `${percentageBox.y1}%`,
                                                    width: `${percentageBox.x2 - percentageBox.x1}%`,
                                                    height: `${percentageBox.y2 - percentageBox.y1}%`,
                                                    border: selectedTable === tableIndex ? '2px solid red' : '2px solid blue',
                                                    cursor: 'pointer',
                                                    backgroundColor: 'rgba(0, 0, 255, 0.1)',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right column: Selected table details */}
                            <div className="flex-1 border rounded-lg p-4">
                                <h3 className="font-semibold mb-4">Table Details</h3>
                                {selectedTable !== null && pageResult.tables[selectedTable] ? (
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-medium">Confidence:</span>{' '}
                                            {pageResult.tables[selectedTable].confidence.score.toFixed(2)}
                                        </p>
                                        {pageResult.tables[selectedTable].table_type && (
                                            <p>
                                                <span className="font-medium">Type:</span>{' '}
                                                {pageResult.tables[selectedTable].table_type}
                                            </p>
                                        )}
                                        <p>
                                            <span className="font-medium">Method:</span>{' '}
                                            {pageResult.tables[selectedTable].confidence.method}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">
                                        Select a table to view details
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default TableDetectionResults; 