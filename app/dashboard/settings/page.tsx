'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    Settings2,
    Lock,
    BellRing,
    UserCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { userService, UserProfile, NotificationSettings } from '@/services/user.service';
import { useAuthStore } from '@/store/useAuthStore';

export default function SettingsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { logout } = useAuthStore();
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const [profileData, notificationData] = await Promise.all([
                userService.getProfile(),
                userService.getNotificationSettings()
            ]);
            setProfile(profileData);
            setNotifications(notificationData);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch user data';

            if (message.includes('No authentication token found')) {
                logout();
                router.push('/login');
                return;
            }

            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!profile) return;

        try {
            const updatedProfile = await userService.updateProfile({
                name: profile.name,
                email: profile.email
            });
            setProfile(updatedProfile);
            toast({
                description: "Profile updated successfully",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to update profile',
                variant: "destructive",
            });
        }
    };

    const handleUpdateNotifications = async () => {
        try {
            const updatedSettings = await userService.updateNotificationSettings(notifications);
            setNotifications(updatedSettings);
            toast({
                description: "Notification settings updated successfully",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to update notifications',
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
            await userService.updatePassword({
                current_password: currentPassword,
                new_password: newPassword
            });

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
                description: error instanceof Error ? error.message : 'Failed to change password',
                variant: "destructive",
            });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await userService.deleteAccount();
            logout();
            router.push('/login');
            toast({
                description: "Account deleted successfully",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to delete account',
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const updatedProfile = await userService.uploadAvatar(file);
            setProfile(updatedProfile);
            toast({
                description: "Avatar updated successfully",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to upload avatar',
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-8">
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
                                    <AvatarImage src={profile?.avatar_url} />
                                    <AvatarFallback className="text-lg">
                                        {profile?.name?.charAt(0) || profile?.email?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                    >
                                        <Camera className="h-4 w-4" />
                                        Change Photo
                                    </Button>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile?.email || ''}
                                        onChange={(e) => setProfile(prev => ({ ...prev!, email: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={profile?.name || ''}
                                        onChange={(e) => setProfile(prev => ({ ...prev!, name: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t pt-6">
                            <Button onClick={handleUpdateProfile} className="gap-2">
                                <Save className="h-4 w-4" />
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
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
                            <Button onClick={handleUpdateNotifications} className="gap-2">
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
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input
                                            id="current-password"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t pt-6">
                                <Button onClick={handleChangePassword} className="gap-2">
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
                                    onClick={() => setDeleteDialogOpen(true)}
                                    className="gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Account
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
        </div>
    );
}
