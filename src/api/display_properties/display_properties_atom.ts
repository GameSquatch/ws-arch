import { atom } from 'jotai';

export interface DisplayProperty {
  internalProp: string;
  externalProp: string;
}

export const displayPropertiesAtom = atom<DisplayProperty | null>(null);
