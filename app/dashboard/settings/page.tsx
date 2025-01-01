'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
    User,
    Bell,
    Shield,
    Mail,
    Key,
    Save,
    Trash2,
    AlertTriangle,
    Camera,
    CheckCircle,
    Settings2,
    Lock,
    BellRing,
    UserCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

interface UserProfile {
    id: number;
    email: string;
    name?: string;
    avatar?: string;
    is_active: boolean;
}

interface NotificationSettings {
    email_notifications: boolean;
    analysis_complete: boolean;
    document_shared: boolean;
    security_alerts: boolean;
}

export default function SettingsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [notifications, setNotifications] = useState<NotificationSettings>({
        email_notifications: true,
        analysis_complete: true,
        document_shared: true,
        security_alerts: true,
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);

    useEffect(() => {
        fetchUserProfile();
        fetchNotificationSettings();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const data = await response.json();
            setProfile(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch user profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchNotificationSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/users/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notification settings');
            }

            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            // Use default settings if fetch fails
            console.error('Failed to fetch notification settings');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/users/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            toast({
                description: "Profile updated successfully",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleUpdateNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/users/notifications`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notifications)
            });

            if (!response.ok) {
                throw new Error('Failed to update notification settings');
            }

            toast({
                description: "Notification settings updated successfully",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update notification settings. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match",
                variant: "destructive",
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/users/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            if (!response.ok) {
                throw new Error('Failed to change password');
            }

            toast({
                description: "Password changed successfully",
                duration: 3000,
            });

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to change password. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}${API_VERSION}/users/me`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            localStorage.removeItem('token');
            router.push('/login');

            toast({
                description: "Account deleted successfully",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDeleteAccountDialog(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Loading settings...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8 pb-10"
            >
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your account settings and set account preferences
                        </p>
                    </div>
                    <Badge variant="outline" className="w-fit gap-2 px-4 py-2 text-base">
                        <UserCircle className="h-4 w-4" />
                        {profile?.email}
                    </Badge>
                </div>

                <Tabs defaultValue="profile" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Shield className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings2 className="h-5 w-5 text-primary" />
                                        Profile Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update your personal information and email settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={profile?.avatar || ''} />
                                            <AvatarFallback className="text-lg">
                                                {profile?.name?.charAt(0) || profile?.email?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Camera className="h-4 w-4" />
                                            Change Photo
                                        </Button>
                                    </div>
                                    <Separator />
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium">
                                                Email Address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profile?.email || ''}
                                                onChange={(e) => setProfile(prev => ({ ...prev!, email: e.target.value }))}
                                                className="h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium">
                                                Full Name
                                            </Label>
                                            <Input
                                                id="name"
                                                value={profile?.name || ''}
                                                onChange={(e) => setProfile(prev => ({ ...prev!, name: e.target.value }))}
                                                className="h-11"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end border-t pt-6">
                                    <Button onClick={handleUpdateProfile} className="gap-2 px-6">
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BellRing className="h-5 w-5 text-primary" />
                                    Notification Preferences
                                </CardTitle>
                                <CardDescription>
                                    Choose what notifications you want to receive
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px] pr-6">
                                    <div className="space-y-6">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="rounded-lg border bg-card p-6 shadow-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Label className="text-base">Email Notifications</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Receive notifications via email
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={notifications.email_notifications}
                                                    onCheckedChange={(checked) =>
                                                        setNotifications(prev => ({ ...prev, email_notifications: checked }))
                                                    }
                                                />
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                            className="rounded-lg border bg-card p-6 shadow-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Label className="text-base">Analysis Complete</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Get notified when document analysis is complete
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={notifications.analysis_complete}
                                                    onCheckedChange={(checked) =>
                                                        setNotifications(prev => ({ ...prev, analysis_complete: checked }))
                                                    }
                                                />
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0.2 }}
                                            className="rounded-lg border bg-card p-6 shadow-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Label className="text-base">Document Shared</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Get notified when someone shares a document with you
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={notifications.document_shared}
                                                    onCheckedChange={(checked) =>
                                                        setNotifications(prev => ({ ...prev, document_shared: checked }))
                                                    }
                                                />
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0.3 }}
                                            className="rounded-lg border bg-card p-6 shadow-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Label className="text-base">Security Alerts</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Get notified about security updates and unusual activity
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={notifications.security_alerts}
                                                    onCheckedChange={(checked) =>
                                                        setNotifications(prev => ({ ...prev, security_alerts: checked }))
                                                    }
                                                />
                                            </div>
                                        </motion.div>
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t pt-6">
                                <Button onClick={handleUpdateNotifications} className="gap-2 px-6">
                                    <Save className="h-4 w-4" />
                                    Save Preferences
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-primary" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription>
                                        Update your password to keep your account secure
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="current-password" className="text-sm font-medium">
                                                Current Password
                                            </Label>
                                            <Input
                                                id="current-password"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="h-11"
                                            />
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-password" className="text-sm font-medium">
                                                New Password
                                            </Label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password" className="text-sm font-medium">
                                                Confirm New Password
                                            </Label>
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="h-11"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end border-t pt-6">
                                    <Button onClick={handleChangePassword} className="gap-2 px-6">
                                        <Key className="h-4 w-4" />
                                        Change Password
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card className="border-destructive/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-destructive">
                                        <AlertTriangle className="h-5 w-5" />
                                        Danger Zone
                                    </CardTitle>
                                    <CardDescription>
                                        Permanently delete your account and all associated data
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                                        <p className="text-sm text-muted-foreground">
                                            Once you delete your account, there is no going back. This action cannot be undone
                                            and will permanently delete all your data, including documents, analyses, and settings.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end border-t pt-6">
                                    <Button
                                        variant="destructive"
                                        onClick={() => setDeleteAccountDialog(true)}
                                        className="gap-2 px-6"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Account
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                <AlertDialog open={deleteAccountDialog} onOpenChange={setDeleteAccountDialog}>
                    <AlertDialogContent className="max-w-[400px]">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                Delete Account
                            </AlertDialogTitle>
                            <AlertDialogDescription className="pt-3">
                                <div className="space-y-4">
                                    <p>
                                        Are you absolutely sure you want to delete your account? This action cannot be undone
                                        and will result in the permanent loss of:
                                    </p>
                                    <ul className="list-inside list-disc space-y-2 text-sm">
                                        <li>All your uploaded documents</li>
                                        <li>Analysis history and results</li>
                                        <li>Account settings and preferences</li>
                                        <li>Access to the platform</li>
                                    </ul>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="border-t pt-4">
                            <AlertDialogCancel className="gap-2">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteAccount}
                                className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Account
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </motion.div>
        </DashboardLayout>
    );
}
