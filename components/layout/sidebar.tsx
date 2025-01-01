'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    History,
    Settings,
    BarChart
} from 'lucide-react';

const navItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: 'Documents',
        href: '/dashboard/documents',
        icon: FileText
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

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="h-screen w-64 border-r bg-card px-3 py-4 flex flex-col">
            <div className="px-3 py-2 mb-6">
                <h2 className="text-lg font-semibold">DIA Platform</h2>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
                ${isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }
              `}
                        >
                            <Icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t pt-4 mt-auto">
                <div className="px-3 py-2">
                    <div className="text-sm font-medium">Document Analysis</div>
                    <div className="text-xs text-muted-foreground">v1.0.0</div>
                </div>
            </div>
        </div>
    );
} 