import { atom, getDefaultStore } from 'jotai';
import { atomWithReducer } from 'jotai/utils';

export interface ContextMenuItem {
  label: string;
  execute: () => void;
}

interface ContextMenuState {
  showing: boolean;
  position: { x: number; y: number };
  menu: ContextMenuItem[];
}

type ContextMenuAction =
  | {
      type: 'show';
      x: number;
      y: number;
      menu: ContextMenuItem[];
    }
  | {
      type: 'hide';
    };

function contextMenuReducer(currentState: ContextMenuState, action: ContextMenuAction): ContextMenuState {
  switch (action.type) {
    case 'show':
      return {
        showing: true,
        position: { x: action.x, y: action.y },
        menu: action.menu.map((menuItem) => {
          return {
            label: menuItem.label,
            execute: () => {
              menuItem.execute();
              getDefaultStore().set(contextMenuAtom, { type: 'hide' });
            },
          };
        }),
      };
    case 'hide':
      return {
        ...currentState,
        showing: false,
        menu: [],
      };
  }
}
const defaultValue: ContextMenuState = {
  showing: false,
  position: { x: 0, y: 0 },
  menu: [],
};

// const baseAtom = atom(defaultValue);

// export const contextMenuAtom = atom((get) => get(baseAtom));

// export const hideContextMenu = atom(null, (_, set) => {
//   set(baseAtom, { ...defaultValue, showing: false });
// });

// export const showContextMenu = atom(
//   null,
//   (
//     _,
//     set,
//     {
//       x,
//       y,
//       menu,
//     }: {
//       x: number;
//       y: number;
//       menu: ContextMenuItem[];
//     }
//   ) => {
//     set(baseAtom, { showing: true, position: { x, y }, menu });
//   }
// );

export const contextMenuAtom = atomWithReducer<ContextMenuState, ContextMenuAction>(
  {
    showing: false,
    position: { x: 0, y: 0 },
    menu: [],
  },
  contextMenuReducer
);
