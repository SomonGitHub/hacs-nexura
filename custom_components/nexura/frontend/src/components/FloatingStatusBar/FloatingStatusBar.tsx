import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Blinds, X } from 'lucide-react';
import type { TileData } from '../../App';
import './FloatingStatusBar.css';

interface FloatingStatusBarProps {
    tiles: TileData[];
    hassEntities: any;
    onToggleLight: (id: string, newState: boolean, entityId?: string) => void;
    onCoverAction: (action: 'open' | 'close' | 'stop', entityId?: string) => void;
}

interface StatusPillProps {
    id: string;
    icon: React.ReactNode;
    label: string;
    items: TileData[];
    onItemAction: (item: TileData) => void;
    itemActionLabel: string;
    onActionAll: () => void;
    actionAllLabel: string;
}

const StatusPill: React.FC<StatusPillProps> = ({
    icon, label, items, onItemAction, itemActionLabel, onActionAll, actionAllLabel
}) => {
    const [isOpen, setIsOpen] = useState(false);

    if (items.length === 0) return null;

    return (
        <div className="status-pill-container">
            <motion.div
                className="status-pill"
                onClick={() => setIsOpen(!isOpen)}
                initial={{ y: -20, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="status-pill-icon">{icon}</div>
                <span>{items.length} {label}{items.length > 1 ? 's' : ''}</span>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="status-details-panel"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="status-details-header">
                            <h3>Détails</h3>
                            <button className="btn-close-panel" onClick={() => setIsOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="status-items-list">
                            {items.map(item => (
                                <div key={item.id} className="status-item">
                                    <span>{item.title || item.entityId}</span>
                                    <button className="btn-toggle-off" onClick={() => onItemAction(item)}>
                                        {itemActionLabel}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button className="btn-turn-off-all" onClick={() => { onActionAll(); setIsOpen(false); }}>
                            {actionAllLabel}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const FloatingStatusBar: React.FC<FloatingStatusBarProps> = ({
    tiles, hassEntities, onToggleLight, onCoverAction
}) => {
    // Lumières allumées
    const activeLights = useMemo(() => {
        return tiles.filter(tile => {
            if (!tile.entityId?.startsWith('light.')) return false;
            const entity = hassEntities[tile.entityId];
            return entity ? entity.state === 'on' : !!tile.isOn;
        });
    }, [tiles, hassEntities]);

    // Volets ouverts (non fermé)
    const activeShutters = useMemo(() => {
        return tiles.filter(tile => {
            if (!tile.entityId?.startsWith('cover.')) return false;
            const entity = hassEntities[tile.entityId];
            // On considère comme "ouvert" tout ce qui n'est pas "closed"
            return entity && entity.state !== 'closed';
        });
    }, [tiles, hassEntities]);

    return (
        <div className="floating-status-bar">
            <StatusPill
                id="lights"
                icon={<Lightbulb size={18} />}
                label="lumière"
                items={activeLights}
                onItemAction={(item) => onToggleLight(item.id, false, item.entityId)}
                itemActionLabel="Éteindre"
                onActionAll={() => activeLights.forEach(item => onToggleLight(item.id, false, item.entityId))}
                actionAllLabel="Tout éteindre"
            />

            <StatusPill
                id="shutters"
                icon={<Blinds size={18} />}
                label="volet ouvert"
                items={activeShutters}
                onItemAction={(item) => onCoverAction('close', item.entityId)}
                itemActionLabel="Fermer"
                onActionAll={() => activeShutters.forEach(item => onCoverAction('close', item.entityId))}
                actionAllLabel="Tout fermer"
            />
        </div>
    );
};
