import { Atom, Getter } from 'jotai';
import { PrimitiveAtom } from 'jotai';
import { atom, getDefaultStore } from 'jotai';

interface AtomFamily<TAtom> {
  (param: string): TAtom;
  remove(param: string): void;
  has(param: string): boolean;
  clear(): void;
}

const atomFamily = <TAtom extends Atom<unknown>>(atomCreator: (param: string) => TAtom): AtomFamily<TAtom> => {
  const atoms = new Map<string, TAtom>();

  const atomAccessor = (param: string) => {
    let cached = atoms.get(param);

    if (cached) {
      return cached;
    }

    const newAtom = atomCreator(param);
    atoms.set(param, newAtom);
    return newAtom;
  };

  atomAccessor.remove = (param: string) => {
    if (atoms.has(param)) {
      atoms.delete(param);
    } else {
      console.warn(`Tried to remove family atom that doesn\'t exist. Key = ${param}`);
    }
  };

  atomAccessor.has = (param: string) => atoms.has(param);

  atomAccessor.clear = () => atoms.clear();

  return atomAccessor;
};

const resetOnUnmountAtom = <T>(initialValue: T) => {
  const newAtom = atom<typeof initialValue>(initialValue);
  newAtom.onMount = () => {
    return () => {
      getDefaultStore().set(newAtom, initialValue);
    };
  };
  return newAtom;
};

const prevStateAtom = <T>(atomGetter: (get: Getter, prevValue: T | null) => T | null, initialValue?: T) => {
  let prevValue = initialValue ?? null;
  return atom((get) => {
    const newValue = atomGetter(get, prevValue);
    prevValue = newValue ?? prevValue;
    return newValue;
  });
};

const selectedKeyAtom = resetOnUnmountAtom<null | string>(null);
const selectedPortalAtom = resetOnUnmountAtom<'platform' | 'asp'>('asp');

const platformTreeAtomFamily = atomFamily((designId: string) => atom());
const platformSelectedKeyAtom = atom((get) => {
  const globalKey = get(selectedKeyAtom);
  if (globalKey && platformTreeAtomFamily.has(globalKey)) {
    return globalKey;
  }
  return null;
});

const aspTreeAtomFamily = atomFamily((designId: string) => atom());
const aspSelectedKeyAtom = atom((get) => {
  const globalKey = get(selectedKeyAtom);
  if (globalKey && aspTreeAtomFamily.has(globalKey)) {
    return globalKey;
  }
  return null;
});

const detailsPanelSelectedKeyAtom = atom((get) => {
  const selectedPortal = get(selectedPortalAtom);
  switch (selectedPortal) {
    case 'platform':
      return get(platformSelectedKeyAtom);
    case 'asp':
      return get(aspSelectedKeyAtom);
    default:
      const _x: never = selectedPortal;
      return _x;
  }
});
