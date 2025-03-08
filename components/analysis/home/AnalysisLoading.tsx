import { motion } from 'framer-motion';
import { Loader2, BarChart4 } from 'lucide-react';

export function AnalysisLoading() {
    return (
        <div className="flex items-center justify-center min-h-[500px]">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BarChart4 className="w-6 h-6 text-primary" />
                    </div>
                </div>
                <p className="text-lg font-medium">Loading analysis data</p>
                <p className="text-sm text-muted-foreground">Please wait while we prepare your analysis dashboard</p>
            </motion.div>
        </div>
    );
} 