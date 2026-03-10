import React, { useEffect, useRef, useState } from 'react';
import './SensorContent.css';

interface SensorContentProps {
    value: string | number;
    unit?: string;
    label?: string;
    variant?: 'none' | 'danger' | 'info';
}

export const SensorContent: React.FC<SensorContentProps> = ({ value, unit, label, variant = 'none' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState<number>(32); // Initial base size

    useEffect(() => {
        if (!containerRef.current || !textRef.current) return;

        const container = containerRef.current;
        const textElement = textRef.current;
        let animationFrameId: number;

        const updateFontSize = () => {
            const containerWidth = container.clientWidth;
            if (containerWidth <= 0) return;

            // Use getBoundingClientRect for sub-pixel accuracy
            const currentWidth = textElement.getBoundingClientRect().width;
            const currentFontSize = parseFloat(window.getComputedStyle(textElement).fontSize);

            if (currentWidth > 0 && currentFontSize > 0) {
                // target 90% of container width to give a safety margin
                const targetWidth = containerWidth * 0.90;
                let newSize = (targetWidth / currentWidth) * currentFontSize;

                // Constraints
                const maxSize = 120;
                const minSize = 12;
                newSize = Math.min(Math.max(newSize, minSize), maxSize);

                // Only update if difference is significant (prevents infinite micro-adjustments loops)
                if (Math.abs(fontSize - newSize) > 0.5) {
                    setFontSize(newSize);
                }
            }
        };

        const observer = new ResizeObserver(() => {
            // Buffer the update to the next animation frame to prevent layout thrashing
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(updateFontSize);
        });

        observer.observe(container);

        // Initial call
        updateFontSize();

        return () => {
            observer.disconnect();
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [value, unit, fontSize]); // Dependencies includes fontSize for the threshold check

    return (
        <div className={`sensor-content variant-${variant}`}>
            <div className="sensor-value-container" ref={containerRef}>
                <div
                    className="sensor-value-wrapper"
                    ref={textRef}
                    style={{ fontSize: `${fontSize}px` }}
                >
                    <span className="sensor-value">{value}</span>
                    {unit && <span className="sensor-unit">{unit}</span>}
                </div>
            </div>
            {label && <div className="sensor-label">{label}</div>}
        </div>
    );
};
