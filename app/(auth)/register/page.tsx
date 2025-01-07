'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { UserPlusIcon, EnvelopeIcon, LockClosedIcon, UserIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/useAuthStore';
import { VALIDATION_RULES, PASSWORD_REQUIREMENTS } from '@/lib/constants';

interface ValidationErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { register, isLoading, error: storeError, clearError } = useAuthStore();
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
    });

    // Clear any auth errors when component unmounts
    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!formData.name.trim()) {
            errors.name = 'Full name is required';
        } else if (formData.name.length < VALIDATION_RULES.fullName.minLength) {
            errors.name = `Full name must be at least ${VALIDATION_RULES.fullName.minLength} characters`;
        } else if (formData.name.length > VALIDATION_RULES.fullName.maxLength) {
            errors.name = `Full name must be less than ${VALIDATION_RULES.fullName.maxLength} characters`;
        }

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!VALIDATION_RULES.email.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (!VALIDATION_RULES.password.test(formData.password)) {
            errors.password = `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters with 1 uppercase, 1 lowercase, and 1 number`;
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({ ...formData, [field]: e.target.value });
        if (validationErrors[field]) {
            setValidationErrors({ ...validationErrors, [field]: undefined });
        }
        if (storeError) {
            clearError();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await register({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                confirm_password: formData.confirmPassword,
            });

            toast({
                description: "Registration successful! Redirecting to dashboard...",
                duration: 3000,
            });

            // No need for setTimeout as the register function already handles login
            router.push('/dashboard');
        } catch (error) {
            toast({
                title: "Registration Failed",
                description: error instanceof Error ? error.message : 'An error occurred during registration',
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
                                        <UserPlusIcon className="w-10 h-10 text-primary" />
                                    </div>
                                </motion.div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                    Create Account
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Sign up for a new account
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
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Full Name
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleInputChange('name')}
                                                className={`pl-9 ${validationErrors.name ? 'border-destructive' : ''}`}
                                                aria-invalid={!!validationErrors.name}
                                                aria-describedby={validationErrors.name ? 'name-error' : undefined}
                                            />
                                            {validationErrors.name && (
                                                <p id="name-error" className="text-xs text-destructive mt-1">
                                                    {validationErrors.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

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
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={handleInputChange('email')}
                                                className={`pl-9 ${validationErrors.email ? 'border-destructive' : ''}`}
                                                aria-invalid={!!validationErrors.email}
                                                aria-describedby={validationErrors.email ? 'email-error' : undefined}
                                            />
                                            {validationErrors.email && (
                                                <p id="email-error" className="text-xs text-destructive mt-1">
                                                    {validationErrors.email}
                                                </p>
                                            )}
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
                                                className={`pl-9 ${validationErrors.password ? 'border-destructive' : ''}`}
                                                aria-invalid={!!validationErrors.password}
                                                aria-describedby={validationErrors.password ? 'password-error' : undefined}
                                            />
                                            {validationErrors.password && (
                                                <p id="password-error" className="text-xs text-destructive mt-1">
                                                    {validationErrors.password}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                                                <LockClosedIcon className="w-4 h-4" />
                                            </div>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange('confirmPassword')}
                                                className={`pl-9 ${validationErrors.confirmPassword ? 'border-destructive' : ''}`}
                                                aria-invalid={!!validationErrors.confirmPassword}
                                                aria-describedby={validationErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                                            />
                                            {validationErrors.confirmPassword && (
                                                <p id="confirmPassword-error" className="text-xs text-destructive mt-1">
                                                    {validationErrors.confirmPassword}
                                                </p>
                                            )}
                                        </div>
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
                                            'Create Account'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>

                            <CardFooter className="flex justify-center py-6 px-8 border-t border-border/10">
                                <p className="text-sm text-muted-foreground">
                                    Already have an account?{' '}
                                    <Link
                                        href="/login"
                                        className="text-primary hover:text-primary/90 transition-colors font-medium"
                                    >
                                        Sign in
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