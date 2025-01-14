import { cn } from '@/lib/utils';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
    id: string;
    title: string;
}

interface StepsProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

export function Steps({ steps, currentStep, className }: StepsProps) {
    return (
        <nav aria-label="Progress" className={cn('w-full', className)}>
            <ol role="list" className="flex items-center">
                {steps.map((step, index) => (
                    <li
                        key={step.id}
                        className={cn(
                            'relative flex-1',
                            index !== steps.length - 1 ? 'pr-8' : ''
                        )}
                    >
                        <div className="flex items-center">
                            <span className="flex items-center">
                                <span
                                    className={cn(
                                        'h-10 w-10 flex items-center justify-center rounded-full text-sm font-semibold ring-2 ring-offset-2',
                                        index < currentStep
                                            ? 'bg-primary text-primary-foreground ring-primary'
                                            : index === currentStep
                                                ? 'border-2 border-primary text-primary ring-primary/30'
                                                : 'bg-muted text-muted-foreground ring-muted'
                                    )}
                                >
                                    {index < currentStep ? (
                                        <CheckIcon className="h-5 w-5" />
                                    ) : (
                                        index + 1
                                    )}
                                </span>
                                <span
                                    className={cn(
                                        'ml-4 text-sm font-medium',
                                        index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                                    )}
                                >
                                    {step.title}
                                </span>
                            </span>
                        </div>

                        {index !== steps.length - 1 && (
                            <div
                                className={cn(
                                    'absolute top-5 left-0 -ml-px mt-0.5 h-0.5 w-full',
                                    index < currentStep ? 'bg-primary' : 'bg-muted'
                                )}
                                aria-hidden="true"
                            />
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
} 