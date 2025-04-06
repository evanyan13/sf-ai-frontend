"use client";
import React, { useEffect, useState } from "react";
import AnalysisFlow from "../ui/analysis/analysis-flow";

export default function AnalysisPage() {
    const [dimensions, setDimensions] = useState({ height: 0, width: 0 });

    useEffect(() => {
        // Set initial dimensions
        setDimensions({
            height: window.innerHeight,
            width: window.innerWidth
        });

        // Handle resize events
        const handleResize = () => {
            setDimensions({
                height: window.innerHeight,
                width: window.innerWidth
            });
        };

        window.addEventListener('resize', handleResize);

        // Clean up
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="h-full w-full" style={{ height: `${dimensions.height}px`, width: `${dimensions.width}px` }}>
            <AnalysisFlow />
        </div>
    );
}