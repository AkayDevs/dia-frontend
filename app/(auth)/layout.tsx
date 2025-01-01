export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <div className="flex min-h-screen">
                {/* Left side - Auth form */}
                <div className="flex flex-1 flex-col justify-center">
                    {children}
                </div>

                {/* Right side - Feature highlights */}
                <div className="relative hidden w-0 flex-1 lg:block">
                    <div className="absolute inset-0 bg-primary/10">
                        <div className="flex h-full flex-col justify-center p-8">
                            <div className="relative left-[calc(50%-12rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/30 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />

                            <div className="relative">
                                <h2 className="text-3xl font-bold">Document Intelligence Analysis</h2>
                                <ul className="mt-6 space-y-4 text-lg">
                                    <li className="flex items-center gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            ✓
                                        </span>
                                        Upload and analyze documents instantly
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            ✓
                                        </span>
                                        Extract tables and text automatically
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            ✓
                                        </span>
                                        Generate summaries and insights
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            ✓
                                        </span>
                                        Export results in multiple formats
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 