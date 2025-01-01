'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { UserMenu } from './user-menu';

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
                    <div>
                        {/* Add search or other header content here */}
                    </div>
                    <UserMenu />
                </header>
                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
} 