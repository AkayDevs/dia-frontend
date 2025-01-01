export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid h-screen grid-cols-1 lg:grid-cols-2">
            {/* Left side - Auth form */}
            <div className="flex items-center justify-center">
                {children}
            </div>

            {/* Right side - Feature highlights */}
            <div className="relative hidden lg:block bg-primary/10">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute left-[calc(50%-12rem)] top-1/2 -translate-y-1/2 aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/30 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>

                <div className="relative h-full flex flex-col justify-center p-8">
                    <div>
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
    );
} 