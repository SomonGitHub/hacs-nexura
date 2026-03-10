import React from 'react';
import { motion } from 'framer-motion';
import { DynamicIcon } from '../DynamicIcon/DynamicIcon';
import { getRoomIcon } from '../../utils/entityMapping';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

interface SidebarProps {
    rooms: string[];
    activeView: string;
    onViewChange: (view: string) => void;
    isEditMode: boolean;
    roomAlerts?: { [key: string]: boolean };
    isFullScreen?: boolean;
    onToggleFullScreen?: () => void;
}

interface NavItemProps {
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
    hasAlert?: boolean;
    className?: string;
}

const NavItem: React.FC<NavItemProps> = ({
    label,
    icon,
    isActive,
    onClick,
    hasAlert = false,
    className = ''
}) => {
    const labelRef = React.useRef<HTMLSpanElement>(null);
    const [isOverflowing, setIsOverflowing] = React.useState(false);
    const [scrollAmount, setScrollAmount] = React.useState(0);

    React.useEffect(() => {
        const checkOverflow = () => {
            if (labelRef.current) {
                const diff = labelRef.current.scrollWidth - labelRef.current.clientWidth;
                // Détection stricte au pixel près pour éviter que les '...' ne restent sans animation
                if (diff > 0) {
                    setIsOverflowing(true);
                    setScrollAmount(diff + 20); // Décalage pour voir bien la fin
                } else {
                    setIsOverflowing(false);
                    setScrollAmount(0);
                }
            }
        };

        checkOverflow();
        // Délai plus long pour laisser les polices/layout se stabiliser
        const timer = setTimeout(checkOverflow, 500);
        window.addEventListener('resize', checkOverflow);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkOverflow);
        };
    }, [label]);

    return (
        <button
            className={`nav-item ${isActive ? 'active' : ''} ${className}`}
            onClick={onClick}
        >
            {isActive && (
                <motion.div
                    layoutId="active-pill"
                    className="nav-active-bg"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            )}
            <div className="nav-item-content">
                <div className="nav-icon-wrapper">
                    <DynamicIcon
                        name={icon}
                        size={20}
                        color={isActive ? 'var(--accent-color)' : 'var(--icon-inactive)'}
                    />
                    {hasAlert && (
                        <motion.span
                            className="nav-alert-dot"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    )}
                </div>
                <div className="nav-label-container">
                    <span
                        ref={labelRef}
                        className={`nav-label ${isOverflowing ? 'should-animate' : ''}`}
                        style={{ '--scroll-x': `-${scrollAmount}px` } as React.CSSProperties}
                    >
                        {label}
                    </span>
                </div>
            </div>
        </button>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({
    rooms,
    activeView,
    onViewChange,
    isEditMode,
    roomAlerts = {},
    isFullScreen = false,
    onToggleFullScreen,
}) => {
    const { t } = useTranslation();

    return (
        <aside className="sidebar-nav">
            <div className="sidebar-section">
                <NavItem
                    label={t('favorites')}
                    icon="Star"
                    isActive={activeView === 'favorites'}
                    onClick={() => onViewChange('favorites')}
                />
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-section rooms-section">
                <h4 className="sidebar-subtitle">{t('rooms')}</h4>
                <div className="rooms-list">
                    {rooms.map(room => (
                        <NavItem
                            key={room}
                            label={room}
                            icon={getRoomIcon(room)}
                            isActive={activeView === room}
                            onClick={() => onViewChange(room)}
                            hasAlert={roomAlerts[room]}
                        />
                    ))}
                </div>
            </div>

            {isEditMode && (
                <div className="sidebar-edit-badge">
                    {t('board.edit_mode')}
                </div>
            )}

            <div className="sidebar-actions">

                <NavItem
                    label={isFullScreen ? "Quitter" : "Immersion"}
                    icon={isFullScreen ? "Minimize" : "Maximize"}
                    isActive={isFullScreen}
                    onClick={onToggleFullScreen || (() => { })}
                    className="nav-item-action"
                />
            </div>
        </aside>
    );
};
