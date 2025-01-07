'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { LockClosedIcon, EnvelopeIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading, error: storeError, clearError } = useAuthStore();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Clear any auth errors when component unmounts
    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    const handleInputChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({ ...formData, [field]: e.target.value });
        if (storeError) {
            clearError();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast({
                title: "Validation Error",
                description: "Please enter both email and password",
                variant: "destructive",
                duration: 5000,
            });
            return;
        }

        try {
            await login({
                email: formData.email,
                password: formData.password
            });

            toast({
                description: "Successfully logged in. Redirecting...",
                duration: 3000,
            });

            router.push('/dashboard');
        } catch (error) {
            toast({
                title: "Login Failed",
                description: error instanceof Error ? error.message : 'An error occurred during login',
                variant: "destructive",
                duration: 5000,
            });
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 w-full">
            <div className="w-full max-w-[540px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="relative overflow-hidden border border-border/50">
                        {/* Gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-sm" />

                        <div className="relative">
                            <CardHeader className="space-y-3 text-center pb-4 pt-8">
                                <motion.div
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                                >
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <LockClosedIcon className="w-10 h-10 text-primary" />
                                    </div>
                                </motion.div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                    Welcome Back
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Sign in to your account to continue
                                </p>
                            </CardHeader>

                            <CardContent className="p-4 md:p-6 lg:p-8">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {storeError && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        >
                                            <Alert variant="destructive" className="text-sm">
                                                <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
                                                <AlertDescription>{storeError}</AlertDescription>
                                            </Alert>
                                        </motion.div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                                                <EnvelopeIcon className="w-4 h-4" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="alice@example.com"
                                                value={formData.email}
                                                onChange={handleInputChange('email')}
                                                className="pl-9"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                                                <LockClosedIcon className="w-4 h-4" />
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleInputChange('password')}
                                                className="pl-9"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remember"
                                                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                            <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                                                Remember me
                                            </Label>
                                        </div>
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm text-primary hover:text-primary/90 transition-colors font-medium"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full mt-6"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                                            />
                                        ) : (
                                            'Sign in'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>

                            <CardFooter className="flex justify-center py-6 px-8 border-t border-border/10">
                                <p className="text-sm text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link
                                        href="/register"
                                        className="text-primary hover:text-primary/90 transition-colors font-medium"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </CardFooter>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </main>
    );
} 