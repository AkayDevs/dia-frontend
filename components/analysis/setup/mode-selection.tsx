'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
    BoltIcon,
    ListBulletIcon
} from '@heroicons/react/24/outline';

interface ModeSelectionProps {
    selectedMode: 'automatic' | 'step_by_step' | null;
    onSelect: (mode: 'automatic' | 'step_by_step') => void;
}

const modes = [
    {
        id: 'automatic',
        title: 'Automatic Mode',
        description: 'Configure all parameters at once and let the system run the complete analysis automatically.',
        icon: BoltIcon,
        features: [
            'Quick and efficient',
            'Best for standard documents',
            'Minimal user intervention required',
            'Results available all at once'
        ]
    },
    {
        id: 'step_by_step',
        title: 'Step-by-Step Mode',
        description: 'Configure and review each step of the analysis process individually.',
        icon: ListBulletIcon,
        features: [
            'Full control over each step',
            'Review and edit intermediate results',
            'Customize parameters per step',
            'Better for complex documents'
        ]
    }
];

export function ModeSelection({ selectedMode, onSelect }: ModeSelectionProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-lg font-medium">Select Analysis Mode</h2>
                <p className="text-sm text-muted-foreground">
                    Choose how you want to run your analysis.
                </p>
            </div>

            <RadioGroup
                value={selectedMode || undefined}
                onValueChange={(value: 'automatic' | 'step_by_step') => onSelect(value)}
            >
                <div className="grid gap-4 md:grid-cols-2">
                    {modes.map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = selectedMode === mode.id;

                        return (
                            <Label
                                key={mode.id}
                                className={`flex flex-col h-full p-6 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'hover:border-primary/50'
                                    }`}
                            >
                                <RadioGroupItem
                                    value={mode.id}
                                    className="sr-only"
                                />
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'
                                            }`} />
                                        <span className="font-medium">{mode.title}</span>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        {mode.description}
                                    </p>

                                    <ul className="space-y-2">
                                        {mode.features.map((feature, index) => (
                                            <li
                                                key={index}
                                                className="text-sm flex items-center text-muted-foreground"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Label>
                        );
                    })}
                </div>
            </RadioGroup>
        </div>
    );
} 