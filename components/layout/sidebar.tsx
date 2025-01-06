'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { documentService, AnalysisStatus } from '@/services/document.service';
import {
    DocumentIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    UserIcon,
    Bars3Icon,
    DocumentTextIcon,
    ClockIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

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
        icon: DocumentIcon
    },
    {
        title: 'Documents',
        href: '/dashboard/documents',
        icon: DocumentTextIcon,
    },
    {
        title: 'Analysis',
        href: '/dashboard/analysis',
        icon: ChartBarIcon
    },
    {
        title: 'History',
        href: '/dashboard/history',
        icon: ClockIcon
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Cog6ToothIcon
    }
];

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const { user, logout } = useAuthStore();
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [processingCount, setProcessingCount] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchProcessingDocuments = async () => {
            try {
                const documents = await documentService.getDocuments({
                    status: AnalysisStatus.PROCESSING
                });
                setProcessingCount(documents.length);
            } catch (error) {
                console.error('Error fetching processing documents:', error);
                // If authentication error, handle logout
                if (error instanceof Error &&
                    (error.message.includes('Could not validate credentials') ||
                        error.message.includes('No authentication token found'))) {
                    handleLogout();
                }
                setProcessingCount(0);
            }
        };

        if (isMounted) {
            fetchProcessingDocuments();
            // Refresh processing count every minute
            const interval = setInterval(fetchProcessingDocuments, 60000);
            return () => clearInterval(interval);
        }
    }, [isMounted]);

    const handleLogout = async () => {
        try {
            logout();
            toast({
                description: "Logged out successfully",
                duration: 2000,
            });
            router.push('/login');
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
                        <ChartBarIcon className="h-6 w-6 text-primary" />
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
                                {item.title === 'Documents' && processingCount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-auto px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/15"
                                    >
                                        {processingCount}
                                    </Badge>
                                )}
                                {isActive && (
                                    <ChevronRightIcon className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                            <UserIcon className="h-5 w-5 text-primary" />
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
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
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
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden fixed top-4 left-4 z-40"
                    >
                        <Bars3Icon className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <aside className={`
            hidden md:flex flex-col w-72 border-r bg-card/50 backdrop-blur-sm
            ${className}
        `}>
            <SidebarContent />
        </aside>
    );
} 