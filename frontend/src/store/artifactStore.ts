import { create } from 'zustand';
import { ArtifactState, EditRecord, LogoData } from '../types';

interface Store {
  artifact: ArtifactState | null;
  editHistory: EditRecord[];
  logos: LogoData[];
  selectedPalette: string;
  tone: 'common-man' | 'academic';
  
  setArtifact: (artifact: ArtifactState) => void;
  addEdit: (edit: EditRecord) => void;
  setLogos: (logos: LogoData[]) => void;
  setPalette: (palette: string) => void;
  setTone: (tone: 'common-man' | 'academic') => void;
  reset: () => void;
}

export const useArtifactStore = create<Store>((set) => ({
  artifact: null,
  editHistory: [],
  logos: [],
  selectedPalette: 'warm-earth',
  tone: 'common-man',
  
  setArtifact: (artifact) => set({ artifact }),
  addEdit: (edit) => set((state) => ({
    editHistory: [...state.editHistory, edit]
  })),
  setLogos: (logos) => set({ logos }),
  setPalette: (palette) => set({ selectedPalette: palette }),
  setTone: (tone) => set({ tone }),
  reset: () => set({
    artifact: null,
    editHistory: [],
    logos: [],
    selectedPalette: 'warm-earth',
    tone: 'common-man'
  })
}));
