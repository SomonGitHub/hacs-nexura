---
title: "Refonte UX/UI : Mode Édition (Smart Glass Overlay)"
date: "2026-03-08"
status: "Approved"
---

# Objectif

Repenser l'expérience utilisateur et l'interface (UX/UI) du mode édition des tuiles du dashboard (BentoGrid). Les boutons actuels s'empilent mal (wrap) sur les petits écrans et utilisent des emojis qui nuisent à l'aspect premium et logiciel du dashboard.

# Solution Retenue : Option 1 "Smart Glass Overlay"

Sur smartphone, l'espace est critique (“Real Estate”) et le doigt (« fat finger ») demande de larges zones de contact (idéalement 44x44px min). L'Option 1 sépare astucieusement l'état interactif (déplacement) et l'état de contrôle (menus).

## Principes de Conception (UX Pro Max)

1. **Suppression de la Pollution Visuelle Initiale** : 
   - Lorsqu'on entre en mode "Édition", les tuiles se parent simplement d'une bordure discrète ("dashed") ou commencent à pulser doucement (effet "Jiggle" d'iOS).
   - **Aucune** icône (crayon, étoile, suppression) n'apparaît directement sur les tuiles (sauf potentiellement un micro-badge "Drag" en haut à gauche pour l'affordance).

2. **Interaction Tactile en Calque (Glassmorphism Overlay)** :
   - Lorsqu'un utilisateur **clique** (ou tape) sur une tuile, celle-ci bascule dans un état "Actif" ou "Focus":
   - Un calque semi-transparent flouté (`backdrop-filter: blur(10px)`) recouvre tout le contenu de **cette seule tuile**.
   - C'est sur ce calque noir élégant qu'apparaissent les "Gros Boutons" de contrôle (Favori, Éditer, Taille, Supprimer), centrés.
   - Les boutons ont la place d'être larges et lisibles.

3. **Icônes SVG au lieu d'Emojis** :
   - L'usage des Emojis (`✏️`, `⭐`, `❌`, `📐`) est remplacé par un composant standardisé utilisant `lucide-react` (ex: `<Pencil>`, `<Star>`, `<Trash2>`, `<Maximize2>`).

4. **Expérience de Déplacement (Drag & Drop)** :
   - Dnd-kit permet le déplacement. L'idéal est que le maintenir appuyé ("Long Press" ou actionner un coin) active le déplacement sans ouvrir le menu de contrôle. 

## Déclinaison Responsive

- **Sur Mobile (< 768px)** : Le calque Overlay est le meilleur choix car il empêche qu'un doigt masque un bouton, la tuile entière "devient" un grand menu.
- **Sur Desktop (> 1024px)** : On pourrait afficher un "Context Menu" au survol de la souris. Mais garder l'Overlay pour la cohérence entre appareils est recommandé.

## Composants à Modifier

- `BentoTile.tsx` : Retrait des `<div className="edit-actions">` conditionnées au mode `isEditMode`. Création d'un état interne `[isOverlayActive, setIsOverlayActive]`.
- `BentoTile.css` : Ajout des classes d'animation pour l'Overlay flouté `.tile-glass-controls`.
- Les icônes SVG viendront via `import { Pencil, Maximize2, Star, Trash2, GripHorizontal } from 'lucide-react'`.
