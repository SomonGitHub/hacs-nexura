import React from 'react';
import type { HassEntities } from 'home-assistant-js-websocket';
import type { TileData, TileType, TileTheme } from '../../App';
import type { TileSize } from '../BentoTile/BentoTile';
import { useTranslation } from 'react-i18next';
import './AddTileModal.css';

interface AddTileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (tile: TileData) => void;
    hassEntities: HassEntities;
    defaultRoom?: string;
    tileToEdit?: TileData;
}

export const AddTileModal: React.FC<AddTileModalProps> = ({ isOpen, onClose, onAdd, hassEntities, defaultRoom, tileToEdit }) => {
    const { t } = useTranslation();
    const [title, setTitle] = React.useState('');
    const [type, setType] = React.useState<TileType>('info');
    const [size, setSize] = React.useState<TileSize>('small');
    const [entityId, setEntityId] = React.useState('');
    const [room, setRoom] = React.useState(defaultRoom || '');
    const [isScannerOpen, setIsScannerOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [tileTheme, setTileTheme] = React.useState<TileTheme | ''>('');

    React.useEffect(() => {
        if (tileToEdit && isOpen) {
            setTitle(tileToEdit.title || '');
            setType(tileToEdit.type || 'info');
            setSize(tileToEdit.size || 'small');
            setEntityId(tileToEdit.entityId || '');
            setRoom(tileToEdit.room || '');
            setTileTheme(tileToEdit.tileTheme || '');
        } else if (isOpen) {
            // Reset for new tile
            setTitle('');
            setType('info');
            setSize('small');
            setEntityId('');
            setRoom(defaultRoom === 'Inconnue' ? '' : (defaultRoom || ''));
        }
    }, [tileToEdit, isOpen, defaultRoom]);

    React.useEffect(() => {
        if ((type === 'cover' || type === 'slider') && size === 'small') {
            setSize('rect');
        }
        if (type === 'scene') {
            setSize('small');
        }
        if (type === 'energy-flow' && (size === 'small' || size === 'rect' || size === 'square')) {
            setSize('large-square');
        }
    }, [type, size]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        // Extract current state for the selected entity if available
        const entity = entityId ? hassEntities[entityId] : null;

        const newTile: TileData = {
            id: Date.now().toString(),
            title,
            room: room || undefined,
            type,
            size,
            entityId: entityId || undefined,
            // Default contents based on type and current entity state
            isOn: type === 'toggle' ? (entity ? entity.state === 'on' : false) : undefined,
            value: type === 'slider' ? (entity?.attributes?.brightness ? Math.round((entity.attributes.brightness / 255) * 100) : 0) : undefined,
            graphData: type === 'graph' ? [] : undefined,
            tileTheme: tileTheme || undefined,
            isFavorite: tileToEdit?.isFavorite,
        };

        onAdd(newTile);
        onClose();
        // Reset form
        setTitle('');
        setType('info');
        setSize('small');
        setEntityId('');
        setRoom(defaultRoom || '');
        setTileTheme('');
        setIsScannerOpen(false);
        setSearchTerm('');
    };

    const handleSelectEntity = (id: string) => {
        setEntityId(id);
        const entity = hassEntities[id];
        if (entity) {
            if (!title) setTitle(entity.attributes.friendly_name || id);
            // Auto-detect type
            if (id.startsWith('cover.')) {
                setType('cover');
                setSize('rect'); // Enforce min size for covers
            } else if (id.startsWith('media_player.')) {
                setType('media');
                setSize('large-rect');
            } else if (id.startsWith('light.') || id.startsWith('switch.')) {
                setType('toggle');
            } else if (id.startsWith('scene.')) {
                setType('scene');
                setSize('small');
            }

            // If room is empty or matches Inconnue, try to pre-fill
            if ((!room || room === 'Inconnue') && entity.attributes.area_id) {
                setRoom(entity.attributes.area_id);
            } else if (!room || room === 'Inconnue') {
                setRoom(defaultRoom || '');
            }
        }
        setIsScannerOpen(false);
    };

    const filteredEntities = Object.keys(hassEntities).filter(id => {
        const entity = hassEntities[id];
        const friendlyName = (entity.attributes.friendly_name || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        // Match ID or Friendly Name
        return id.toLowerCase().includes(searchLower) || friendlyName.includes(searchLower);
    }).slice(0, 50); // Increased limit to 50 for better usability without too much lag

    return (
        <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{tileToEdit ? t('add_tile_modal.edit_title') : t('add_tile_modal.add_title')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group entity-scanner-group">
                        <label>{t('add_tile_modal.form.entity')} (optionnel)</label>
                        <div className="input-with-action">
                            <input
                                type="text"
                                value={entityId}
                                onChange={(e) => setEntityId(e.target.value)}
                                placeholder={t('add_tile_modal.form.entity_placeholder')}
                            />
                            <button
                                type="button"
                                className="btn-icon"
                                onClick={() => setIsScannerOpen(!isScannerOpen)}
                                title="Scanner les entités"
                            >
                                🔍
                            </button>
                        </div>

                        {isScannerOpen && (
                            <div className="entity-scanner-dropdown">
                                <input
                                    type="text"
                                    className="scanner-search"
                                    placeholder={t('add_tile_modal.form.entity_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                                <div className="entity-list">
                                    {filteredEntities.map(id => (
                                        <div
                                            key={id}
                                            className="entity-item"
                                            onClick={() => handleSelectEntity(id)}
                                        >
                                            <span className="entity-name">{hassEntities[id].attributes.friendly_name || id}</span>
                                            <span className="entity-id">{id}</span>
                                        </div>
                                    ))}
                                    {filteredEntities.length === 0 && <div className="no-result">Aucune entité trouvée</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>{t('add_tile_modal.form.title')}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('add_tile_modal.form.title_placeholder')}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('add_tile_modal.form.room')} (optionnel)</label>
                        <input
                            type="text"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            placeholder={t('add_tile_modal.form.room_placeholder')}
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('add_tile_modal.form.type')}</label>
                        <select value={type} onChange={(e) => setType(e.target.value as TileType)}>
                            <option value="info">{t('add_tile_modal.form.types.info')}</option>
                            <option value="toggle">{t('add_tile_modal.form.types.toggle')}</option>
                            <option value="slider">{t('add_tile_modal.form.types.slider')}</option>
                            <option value="graph">{t('add_tile_modal.form.types.graph')}</option>
                            <option value="cover">{t('add_tile_modal.form.types.cover')}</option>
                            <option value="media">{t('add_tile_modal.form.types.media')}</option>
                            <option value="energy-gauge">{t('add_tile_modal.form.types.energy-gauge')}</option>
                            <option value="energy-flow">{t('add_tile_modal.form.types.energy-flow')}</option>
                            <option value="scene">{t('add_tile_modal.form.types.scene')}</option>
                            <option value="spacer">{t('add_tile_modal.form.types.spacer')}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('add_tile_modal.form.theme')} (Optionnel)</label>
                        <select value={tileTheme} onChange={(e) => setTileTheme(e.target.value as TileTheme | '')}>
                            <option value="">Par défaut ({t('add_tile_modal.form.themes.glass')})</option>
                            <option value="solid">{t('add_tile_modal.form.themes.solid')}</option>
                            <option value="gradient">{t('add_tile_modal.form.themes.gradient')}</option>
                            <option value="minimal">{t('add_tile_modal.form.themes.minimal')}</option>
                            <option value="neon">{t('add_tile_modal.form.themes.neon')}</option>
                            <option value="frosted">{t('add_tile_modal.form.themes.frosted')}</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>{t('add_tile_modal.cancel')}</button>
                        <div className="modal-actions-right">
                            <button type="submit" className="btn-primary">{tileToEdit ? t('add_tile_modal.save') : t('add_tile_modal.add')}</button>
                            <a href="https://www.buymeacoffee.com/simonv" target="_blank" rel="noreferrer" className="bmc-button">
                                <img
                                    src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                                    alt="Buy Me A Coffee"
                                    style={{ height: '36px', width: '130px' }}
                                />
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
