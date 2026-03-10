import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';
import type { TileData } from '../../App';
import './FloatingStatusBar.css';

interface FloatingStatusBarProps {
    tiles: TileData[];
    hassEntities: any;
    onToggleLight: (id: string, newState: boolean, entityId?: string) => void;
}

export const FloatingStatusBar: React.FC<FloatingStatusBarProps> = ({ tiles, hassEntities, onToggleLight }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Filtrer les lumières configurées sur le dashboard qui sont actuellement allumées
    const activeLights = useMemo(() => {
        return tiles.filter(tile => {
            // Vérifier si c'est une lumière
            if (!tile.entityId?.startsWith('light.')) return false;

            const entity = hassEntities[tile.entityId];
            // Si l'entité existe dans HA, on vérifie son état, sinon on prend l'état local de la tuile
            const isOn = entity ? entity.state === 'on' : !!tile.isOn;
            return isOn;
        });
    }, [tiles, hassEntities]);

    if (activeLights.length === 0) {
        if (isOpen) setIsOpen(false);
        return null;
    }

    const handleToggleOff = (tile: TileData) => {
        onToggleLight(tile.id, false, tile.entityId);
    };

    const handleTurnOffAll = () => {
        activeLights.forEach(tile => {
            onToggleLight(tile.id, false, tile.entityId);
        });
        setIsOpen(false);
    };

    return (
        <div className="floating-status-bar">
            <motion.div
                className="status-pill"
                onClick={() => setIsOpen(!isOpen)}
                initial={{ y: -20, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Lightbulb size={18} className="status-pill-icon" />
                <span>{activeLights.length} lumière{activeLights.length > 1 ? 's' : ''} allumée{activeLights.length > 1 ? 's' : ''}</span>
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
                            {activeLights.map(tile => (
                                <div key={tile.id} className="status-item">
                                    <span>{tile.title || tile.entityId}</span>
                                    <button className="btn-toggle-off" onClick={() => handleToggleOff(tile)}>Éteindre</button>
                                </div>
                            ))}
                        </div>

                        <button className="btn-turn-off-all" onClick={handleTurnOffAll}>
                            Tout éteindre
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
