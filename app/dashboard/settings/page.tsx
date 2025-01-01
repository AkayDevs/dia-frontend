'use client';

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, User, Bell, Shield, Database } from "lucide-react";

export default function SettingsPage() {
    const handleSaveSettings = () => {
        // Implement settings save logic
        console.log("Saving settings");
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                </div>

                <Tabs defaultValue="account" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="account" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Account
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Privacy
                        </TabsTrigger>
                        <TabsTrigger value="storage" className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Storage
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="account" className="space-y-4">
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="Your name" defaultValue="Alice Smith" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Your email" defaultValue="alice@example.com" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="language">Preferred Language</Label>
                                    <Select defaultValue="en">
                                        <SelectTrigger id="language">
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-4">
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Analysis Completion</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Receive notifications when document analysis is complete
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Error Notifications</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Receive notifications about analysis errors
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="privacy" className="space-y-4">
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Privacy Settings</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Data Collection</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Allow collection of analysis data for service improvement
                                        </div>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Document Retention</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Keep analyzed documents for future reference
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="storage" className="space-y-4">
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Storage Management</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Auto-delete Old Analyses</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Automatically delete analyses older than 30 days
                                        </div>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="retention">Data Retention Period</Label>
                                    <Select defaultValue="30">
                                        <SelectTrigger id="retention">
                                            <SelectValue placeholder="Select period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7">7 days</SelectItem>
                                            <SelectItem value="30">30 days</SelectItem>
                                            <SelectItem value="90">90 days</SelectItem>
                                            <SelectItem value="365">1 year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
} 