'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
<<<<<<< HEAD
import { LogOut, Settings, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
=======
import { LogOut, Settings, User, FileText, Bell, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserResponse {
    id: string;
    email: string;
    name: string;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}
>>>>>>> 238a4d0 (Initial Commit)

export function UserMenu() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                <span className="text-sm font-medium hidden md:block">
                    {user.name}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-card shadow-lg">
                    <div className="p-2">
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            Signed in as <br />
                            <strong className="text-foreground">{user.email}</strong>
                        </div>

                        <div className="h-px bg-border my-2" />

                        <button
                            onClick={() => router.push('/dashboard/profile')}
                            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                            <User className="w-4 h-4" />
                            Profile
                        </button>

                        <button
                            onClick={() => router.push('/dashboard/settings')}
                            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </button>

                        <div className="h-px bg-border my-2" />

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 