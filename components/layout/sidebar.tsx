'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import {
    LayoutDashboard,
    FileText,
    History,
    Settings,
    BarChart,
    Menu,
    LogOut,
    User,
    ChevronRight
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
}

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: 'Documents',
        href: '/dashboard/documents',
        icon: FileText,
    },
    {
        title: 'Analysis',
        href: '/dashboard/analysis',
        icon: BarChart
    },
    {
        title: 'History',
        href: '/dashboard/history',
        icon: History
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings
    }
];

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { toast } = useToast();
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                // Decode the JWT token to get user info
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    name: tokenPayload.name || 'User',
                    email: tokenPayload.email || 'user@example.com'
                });

            } catch (error) {
                console.error('Failed to decode user token:', error);
                // If token is invalid, redirect to login
                window.location.href = '/login';
            }
        };

        const fetchPendingDocuments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${API_URL}${API_VERSION}/documents/list?status=processing`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPendingCount(data.length);
                } else if (response.status === 401) {
                    // If unauthorized, redirect to login
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error('Failed to fetch pending documents:', error);
                setPendingCount(0);
            }
        };

        fetchUserProfile();
        fetchPendingDocuments();

        // Refresh pending count every minute
        const interval = setInterval(fetchPendingDocuments, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        try {
            // Clear the token
            localStorage.removeItem('token');

            // Show success message
            toast({
                description: "Logged out successfully",
                duration: 2000,
            });

            // Redirect to login page
            setTimeout(() => {
                window.location.href = '/login';
            }, 500);
        } catch (error) {
            toast({
                title: "Logout Failed",
                description: "Please try again",
                variant: "destructive",
            });
        }
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col gap-4">
            <div className="px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 backdrop-blur-sm">
                        <BarChart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">DIA Platform</h2>
                        <p className="text-xs text-muted-foreground">Document Intelligence Analysis</p>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 px-3">
                <div className="space-y-1 p-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium
                                    transition-all duration-200 ease-in-out
                                    hover:bg-muted/80 hover:shadow-sm
                                    ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }
                                `}
                                onClick={() => setIsOpen(false)}
                            >
                                <div className={`
                                    p-1 rounded-md transition-colors duration-200
                                    ${isActive ? 'bg-primary-foreground/10' : 'bg-background/50 group-hover:bg-background'}
                                `}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className="flex-1">{item.title}</span>
                                {item.title === 'Documents' && pendingCount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-auto px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/15"
                                    >
                                        {pendingCount}
                                    </Badge>
                                )}
                                {isActive && (
                                    <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </ScrollArea>

            <div className="mt-auto px-4 py-4 border-t bg-muted/30">
                <Separator className="mb-4 opacity-50" />
                {user && (
                    <div className="mb-4 flex items-center gap-3 rounded-lg p-3 bg-background/50 backdrop-blur-sm shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium tracking-tight">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    </div>
                )}

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 px-4 hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>

                <div className="mt-6 text-center">
                    <div className="text-sm font-medium bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                        Document Analysis
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Version 1.0.0</div>
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open Menu">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div className={`hidden md:flex h-screen w-64 flex-col border-r bg-card ${className}`}>
            <SidebarContent />
        </div>
    );
} 