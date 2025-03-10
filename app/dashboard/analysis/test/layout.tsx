import React from 'react';

export const metadata = {
    title: 'Analysis Components Test | DIA',
    description: 'Test page for analysis components registry',
};

export default function TestAnalysisLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full">
            <div className="py-6">
                <div className="mx-auto px-4 sm:px-6 md:px-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Analysis Components Test</h1>
                </div>
                <div className="mx-auto px-4 sm:px-6 md:px-8">
                    <div className="py-4">{children}</div>
                </div>
            </div>
        </div>
    );
} 