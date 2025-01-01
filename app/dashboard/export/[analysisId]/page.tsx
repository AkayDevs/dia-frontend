'use client';

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileText, Table, FileJson, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function ExportPage({ params }: { params: { analysisId: string } }) {
    const handleExport = (format: string) => {
        // Implement export logic
        console.log(`Exporting in ${format} format for analysis:`, params.analysisId);
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Export Results</h1>
                    <Button onClick={() => handleExport("all")} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export All
                    </Button>
                </div>

                <Tabs defaultValue="text" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="text" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Text
                        </TabsTrigger>
                        <TabsTrigger value="tables" className="flex items-center gap-2">
                            <Table className="h-4 w-4" />
                            Tables
                        </TabsTrigger>
                        <TabsTrigger value="raw" className="flex items-center gap-2">
                            <FileJson className="h-4 w-4" />
                            Raw Data
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="space-y-4">
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Text Export Options</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Include Formatting</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Preserve text formatting from the original document
                                        </div>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Include Metadata</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Include document metadata in the export
                                        </div>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex gap-2 mt-6">
                                    <Button onClick={() => handleExport("txt")} variant="outline" className="flex items-center gap-2">
                                        <FileDown className="h-4 w-4" />
                                        Export as TXT
                                    </Button>
                                    <Button onClick={() => handleExport("docx")} variant="outline" className="flex items-center gap-2">
                                        <FileDown className="h-4 w-4" />
                                        Export as DOCX
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tables" className="space-y-4">
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Table Export Options</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Include Headers</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Include table headers in the export
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Preserve Merged Cells</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Maintain merged cells in the exported format
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex gap-2 mt-6">
                                    <Button onClick={() => handleExport("csv")} variant="outline" className="flex items-center gap-2">
                                        <FileDown className="h-4 w-4" />
                                        Export as CSV
                                    </Button>
                                    <Button onClick={() => handleExport("xlsx")} variant="outline" className="flex items-center gap-2">
                                        <FileDown className="h-4 w-4" />
                                        Export as XLSX
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="raw" className="space-y-4">
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Raw Data Export Options</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Include Confidence Scores</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Include detection confidence scores in the export
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Include Coordinates</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Include element coordinates from the original document
                                        </div>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex gap-2 mt-6">
                                    <Button onClick={() => handleExport("json")} variant="outline" className="flex items-center gap-2">
                                        <FileDown className="h-4 w-4" />
                                        Export as JSON
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
} 