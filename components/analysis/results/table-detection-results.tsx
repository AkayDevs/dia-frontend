import React, { useState } from 'react';

// Interface for individual bounding boxes detected
interface BoundingBox {
    id: string;
    x: number; // x position as percentage
    y: number; // y position as percentage
    width: number; // width as percentage
    height: number; // height as percentage
    details: string; // Additional details about this detection
}

// Interface for table detection result on a page
interface TableDetectionResult {
    pageImage: string; // URL or path of the document page image
    boundingBoxes: BoundingBox[];
}

// Props for our component
interface TableDetectionResultsProps {
    result: TableDetectionResult;
}

const TableDetectionResults: React.FC<TableDetectionResultsProps> = ({ result }) => {
    const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);

    const handleBoxClick = (box: BoundingBox) => {
        setSelectedBox(box);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
                <img
                    src={result.pageImage}
                    alt="Document Page"
                    style={{ width: '100%', height: 'auto' }}
                />
                {result.boundingBoxes.map((box) => (
                    <div
                        key={box.id}
                        onClick={() => handleBoxClick(box)}
                        style={{
                            position: 'absolute',
                            left: `${box.x}%`,
                            top: `${box.y}%`,
                            width: `${box.width}%`,
                            height: `${box.height}%`,
                            border: selectedBox?.id === box.id ? '2px solid red' : '2px solid blue',
                            cursor: 'pointer',
                        }}
                    />
                ))}
            </div>
            <div style={{ flex: 1, border: '1px solid #ddd', padding: '20px' }}>
                <h2>Table Details</h2>
                {selectedBox ? (
                    <div>
                        <p><strong>ID:</strong> {selectedBox.id}</p>
                        <p><strong>Details:</strong> {selectedBox.details}</p>
                    </div>
                ) : (
                    <p>Select a table bounding box to see details.</p>
                )}
            </div>
        </div>
    );
};

export default TableDetectionResults; 