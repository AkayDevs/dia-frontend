'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { AnalysisStatus } from '@/types/analysis_configs';
import { AnalysisRunWithResults } from '@/types/analysis_execution';
import { Document, DocumentWithAnalysis } from '@/types/document';
import {
    DocumentIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    UserIcon,
    Bars3Icon,
    DocumentTextIcon,
    ClockIcon,
    ChevronRightIcon,
    DocumentDuplicateIcon,
    DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    description?: string;
    showProcessingCount?: boolean;
}

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: DocumentIcon,
        description: 'Overview and quick actions'
    },
    {
        title: 'Documents',
        href: '/dashboard/documents',
        icon: DocumentTextIcon,
        description: 'Manage your documents',
        showProcessingCount: true
    },
    {
        title: 'Analysis',
        href: '/dashboard/analysis',
        icon: ChartBarIcon,
        description: 'Analyze documents'
    },
    {
        title: 'Batch Processing',
        href: '/dashboard/batch',
        icon: DocumentDuplicateIcon,
        description: 'Process multiple documents'
    },
    {
        title: 'History',
        href: '/dashboard/history',
        icon: ClockIcon,
        description: 'View analysis history'
    },
    {
        title: 'Templates',
        href: '/dashboard/templates',
        icon: DocumentMagnifyingGlassIcon,
        description: 'Manage analysis templates'
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Cog6ToothIcon,
        description: 'Configure your preferences'
    }
] as const;

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const { user, logout } = useAuthStore();
    const {
        documents,
        isLoading,
        error,
        fetchDocuments,
    } = useDocumentStore();

    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Calculate processing documents count
    const processingCount = useMemo(() => {
        if (!documents) return 0;
        return (documents as Array<DocumentWithAnalysis>).filter(doc =>
            doc.analyses?.some(analysis => analysis.status === AnalysisStatus.IN_PROGRESS)
        ).length;
    }, [documents]);

    // Handle window resize
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();

        const debouncedResize = debounce(checkMobile, 100);
        window.addEventListener('resize', debouncedResize);
        return () => window.removeEventListener('resize', debouncedResize);
    }, []);

    // Component mount handling
    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    // Fetch documents and handle errors
    const updateDocuments = useCallback(async () => {
        try {
            await fetchDocuments();
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Too many requests')) {
                    toast({
                        title: "Rate Limited",
                        description: "Please wait a moment before refreshing",
                        variant: "destructive",
                    });
                } else if (error.message.includes('authentication')) {
                    handleLogout();
                }
            }
        }
    }, [fetchDocuments, toast]);

    // Periodic document updates
    useEffect(() => {
        if (!isMounted) return;

        updateDocuments();
        const interval = setInterval(updateDocuments, 120000); // 2 minutes
        return () => clearInterval(interval);
    }, [isMounted, updateDocuments]);

    const handleLogout = async () => {
        try {
            await logout();
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

    // Debounce helper function
    function debounce(fn: Function, ms: number) {
        let timer: NodeJS.Timeout;
        return function (this: any, ...args: any[]) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), ms);
        };
    }

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
            <Link
                href={item.href}
                className={cn(
                    'group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium',
                    'transition-all duration-200 ease-in-out',
                    'hover:bg-muted/80 hover:shadow-sm',
                    isActive
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                        : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setIsOpen(false)}
            >
                <div className={cn(
                    'p-1 rounded-md transition-colors duration-200',
                    isActive ? 'bg-primary-foreground/10' : 'bg-background/50 group-hover:bg-background'
                )}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                    <div>{item.title}</div>
                    {item.description && (
                        <div className="text-xs text-muted-foreground/70 font-normal">
                            {item.description}
                        </div>
                    )}
                </div>
                {item.showProcessingCount && processingCount > 0 && (
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
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 border-b">
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

            <ScrollArea className="flex-1 h-[calc(100vh-5rem)] w-full">
                <div className="space-y-1 p-4">
                    {navItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </div>
            </ScrollArea>

            <div className="sticky bottom-0 z-20 mt-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-muted">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">{user?.name || 'User'}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="hover:bg-destructive/10 hover:text-destructive"
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Bars3Icon className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-30 h-screen w-72 border-r bg-background",
            className
        )}>
            <SidebarContent />
        </aside>
    );
} 