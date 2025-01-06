'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { Sidebar } from '@/components/layout/sidebar';
import { UserMenu } from '@/components/layout/user-menu';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, token, user } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const initializeUser = async () => {
            if (isAuthenticated && token && !user) {
                try {
                    const userData = await authService.getCurrentUser(token);
                    useAuthStore.setState({ user: userData });
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                    useAuthStore.getState().logout();
                    router.push('/login');
                }
            }
        };

        if (isMounted) {
            initializeUser();
        }
    }, [isMounted, isAuthenticated, token, user, router]);

    useEffect(() => {
        if (isMounted && (!isAuthenticated || !token)) {
            router.push('/login');
        }
    }, [isMounted, isAuthenticated, token, router]);

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
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <header className="w-full h-16 border-b bg-background">
                        <div className="h-full px-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-4 mr-4">
                                <UserMenu />
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto">
                        <div className="relative">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <Toaster />
        </div>
    );
} 