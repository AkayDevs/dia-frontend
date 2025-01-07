'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { Sidebar } from '@/components/layout/sidebar';
import { UserMenu } from '@/components/layout/user-menu';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDocumentStore } from '@/store/useDocumentStore';
import { cn } from '@/lib/utils';
import {
    Bars3Icon,
    XMarkIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, token, user, logout } = useAuthStore();
    const { isLoading: isDocumentsLoading } = useDocumentStore();
    const [isMounted, setIsMounted] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Handle initial mounting and check authentication
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Handle authentication and user data
    useEffect(() => {
        const initializeUser = async () => {
            if (isAuthenticated && token && !user) {
                try {
                    const userData = await authService.getCurrentUser();
                    useAuthStore.setState({ user: userData });
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                    logout();
                    router.push('/login');
                }
            }
        };

        if (isMounted) {
            initializeUser();
        }
    }, [isMounted, isAuthenticated, token, user, logout, router]);

    // Redirect if not authenticated
    useEffect(() => {
        if (isMounted && (!isAuthenticated || !token)) {
            router.push('/login');
        }
    }, [isMounted, isAuthenticated, token, router]);

    // Handle screen size changes for sidebar
    useEffect(() => {
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth >= 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const userData = await authService.getCurrentUser();
            useAuthStore.setState({ user: userData });
        } catch (error) {
            console.error('Failed to refresh:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Don't render anything until the component is mounted
    if (!isMounted) {
        return null;
    }

    // After mounting, check authentication
    if (!isAuthenticated || !token) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="flex">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content - Add margin to account for fixed sidebar */}
                <div className="flex-1 flex flex-col min-w-0 md:ml-72">
                    {/* Header */}
                    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="container flex h-16 items-center justify-between px-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="md:hidden"
                                >
                                    {isSidebarOpen ? (
                                        <XMarkIcon className="h-5 w-5" />
                                    ) : (
                                        <Bars3Icon className="h-5 w-5" />
                                    )}
                                </Button>
                                <div className="hidden md:block">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                        className={cn("transition-transform", {
                                            "animate-spin": isRefreshing
                                        })}
                                    >
                                        <ArrowPathIcon className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <UserMenu />
                            </div>
                        </div>

                        {/* Global loading indicator */}
                        {(isDocumentsLoading || isRefreshing) && (
                            <Progress
                                value={undefined}
                                className="absolute bottom-0 left-0 right-0 h-0.5 animate-pulse"
                            />
                        )}
                    </header>

                    {/* Main content area */}
                    <main className="flex-1">
                        <div className="container py-6 md:py-8 px-4">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* Backdrop for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Toaster />
        </div>
    );
} 