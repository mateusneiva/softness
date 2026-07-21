'use client';

import { create } from 'zustand';

export type CollectionPreview = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  season?: string | null;
  description?: string | null;
};

export type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type TransitionDirection = 'expand' | 'collapse';

type CollectionTransitionState = {
  preview: CollectionPreview | null;
  from: Rect | null;
  direction: TransitionDirection | null;
  active: boolean;
  seamlessHandoff: boolean;
  setPreview: (preview: CollectionPreview | null) => void;
  startExpand: (preview: CollectionPreview, from: Rect) => void;
  startCollapse: (preview: CollectionPreview, from: Rect) => void;
  finish: () => void;
  clearHandoff: () => void;
  clear: () => void;
};

export const useCollectionTransitionStore = create<CollectionTransitionState>((set) => ({
  preview: null,
  from: null,
  direction: null,
  active: false,
  seamlessHandoff: false,
  setPreview: (preview) => set({ preview }),
  startExpand: (preview, from) =>
    set({
      preview,
      from,
      direction: 'expand',
      active: true,
      seamlessHandoff: false,
    }),
  startCollapse: (preview, from) =>
    set({
      preview,
      from,
      direction: 'collapse',
      active: true,
      seamlessHandoff: false,
    }),
  finish: () =>
    set((state) => ({
      active: false,
      from: null,
      direction: null,
      seamlessHandoff: state.direction === 'expand' || state.direction === 'collapse',
    })),
  clearHandoff: () => set({ seamlessHandoff: false }),
  clear: () =>
    set({
      preview: null,
      from: null,
      direction: null,
      active: false,
      seamlessHandoff: false,
    }),
}));
