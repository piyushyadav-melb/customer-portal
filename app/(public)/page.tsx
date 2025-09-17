"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Dynamically import the component to avoid SSR issues
const FindExpertPublic = dynamic(
    () => import("@/components/public-components/FindExpertPublic"),
    {
        ssr: false,
        loading: () => (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ),
    }
);

const HomePage = () => {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <FindExpertPublic />
        </Suspense>
    );
};

export default HomePage;
