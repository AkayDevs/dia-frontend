'use client';

import { useState } from 'react';
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
import { authService } from '@/services/auth.service';
import { VALIDATION_RULES, PASSWORD_REQUIREMENTS } from '@/lib/constants';

interface ValidationErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!formData.fullName.trim()) {
            errors.fullName = 'Full name is required';
        } else if (formData.fullName.length < VALIDATION_RULES.fullName.minLength) {
            errors.fullName = `Full name must be at least ${VALIDATION_RULES.fullName.minLength} characters`;
        } else if (formData.fullName.length > VALIDATION_RULES.fullName.maxLength) {
            errors.fullName = `Full name must be less than ${VALIDATION_RULES.fullName.maxLength} characters`;
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await authService.register({
                email: formData.email,
                password: formData.password,
                name: formData.fullName,
                confirm_password: formData.confirmPassword,
            });

            toast({
                description: "Registration successful! Please log in.",
                duration: 3000,
            });

            setTimeout(() => router.push('/login'), 1500);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
            setError(errorMessage);
            toast({
                title: "Registration Failed",
                description: errorMessage,
                variant: "destructive",
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
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
                                    <UserPlusIcon className="w-10 h-10 text-primary" />
                                </div>
                            </motion.div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                Create Account
                            </h1>
                            <p className="text-sm text-muted-foreground px-4">
                                Sign up for a new account
                            </p>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <Alert variant="destructive" className="text-sm">
                                            <ExclamationCircleIcon className="h-4 w-4" />
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    </motion.div>
                                )}

                                <div className="space-y-3">
                                    <Label htmlFor="fullName" className="text-sm font-medium inline-block">
                                        Full Name
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <Input
                                            id="fullName"
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={handleInputChange('fullName')}
                                            className={`pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary ${validationErrors.fullName ? 'border-red-500' : ''
                                                }`}
                                            aria-invalid={!!validationErrors.fullName}
                                            aria-describedby={validationErrors.fullName ? 'fullName-error' : undefined}
                                        />
                                        {validationErrors.fullName && (
                                            <p id="fullName-error" className="text-xs text-red-500 mt-1">
                                                {validationErrors.fullName}
                                            </p>
                                        )}
                                    </div>
                                </div>

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
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={handleInputChange('email')}
                                            className={`pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary ${validationErrors.email ? 'border-red-500' : ''
                                                }`}
                                            aria-invalid={!!validationErrors.email}
                                            aria-describedby={validationErrors.email ? 'email-error' : undefined}
                                        />
                                        {validationErrors.email && (
                                            <p id="email-error" className="text-xs text-red-500 mt-1">
                                                {validationErrors.email}
                                            </p>
                                        )}
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
                                            value={formData.password}
                                            onChange={handleInputChange('password')}
                                            className={`pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary ${validationErrors.password ? 'border-red-500' : ''
                                                }`}
                                            aria-invalid={!!validationErrors.password}
                                            aria-describedby={validationErrors.password ? 'password-error' : undefined}
                                        />
                                        {validationErrors.password && (
                                            <p id="password-error" className="text-xs text-red-500 mt-1">
                                                {validationErrors.password}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium inline-block">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                                            <LockClosedIcon className="w-5 h-5" />
                                        </div>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange('confirmPassword')}
                                            className={`pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary ${validationErrors.confirmPassword ? 'border-red-500' : ''
                                                }`}
                                            aria-invalid={!!validationErrors.confirmPassword}
                                            aria-describedby={validationErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                                        />
                                        {validationErrors.confirmPassword && (
                                            <p id="confirmPassword-error" className="text-xs text-red-500 mt-1">
                                                {validationErrors.confirmPassword}
                                            </p>
                                        )}
                                    </div>
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
                                            'Create Account'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>

                        <CardFooter className="flex justify-center py-6 px-8 border-t border-muted-foreground/10">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
} 