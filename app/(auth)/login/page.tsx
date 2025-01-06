'use client';

import { useState } from 'react';
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
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading, error: authError } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: "Validation Error",
                description: "Please enter both email and password",
                variant: "destructive",
                duration: 5000,
            });
            return;
        }

        try {
            await login({ email, password });

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 p-4 md:p-2 w-full">
            <div className="w-full max-w-[540px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                >
                    <Card className="backdrop-blur-sm bg-card/50 shadow-xl border-muted/20">
                        <CardHeader className="space-y-3 text-center pt-8 pb-4">
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                            >
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <LockClosedIcon className="w-10 h-10 text-primary" />
                                </div>
                            </motion.div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                Welcome Back
                            </h1>
                            <p className="text-sm text-muted-foreground px-4">
                                Sign in to your account to continue
                            </p>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {authError && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <Alert variant="destructive" className="text-sm">
                                            <AlertDescription>{authError}</AlertDescription>
                                        </Alert>
                                    </motion.div>
                                )}

                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-sm font-medium inline-block">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                                            <EnvelopeIcon className="w-5 h-5" />
                                        </div>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="alice@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="password" className="text-sm font-medium inline-block">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                                            <LockClosedIcon className="w-5 h-5" />
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                                            Remember me
                                        </Label>
                                    </div>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-sm shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                                            />
                                        ) : (
                                            'Sign in'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>

                        <CardFooter className="flex justify-center py-6 px-8 border-t border-muted-foreground/10">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link
                                    href="/register"
                                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
} 