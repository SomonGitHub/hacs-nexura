import React from 'react';
import './BentoGrid.css';

interface BentoGridProps {
    children: React.ReactNode;
}

/**
 * BentoGrid component that organizes BentoTiles in a responsive grid.
 */
export const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(({ children }, ref) => {
    return (
        <div className="bento-grid" ref={ref}>
            {children}
        </div>
    );
});
