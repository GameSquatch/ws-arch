import { atom } from 'jotai';

export interface TabData {
  tabId: string;
  objectId: string;
  type: 'placeholder';
  label: string;
  icon?: string;
}

export const editorTabsAtom = atom<TabData[]>([]);

// write-only
export const addTabAtom = atom(null, (_, set, tabData: TabData) => {
  set(editorTabsAtom, (tabs) => [...tabs, tabData]);
  set(selectedTabIdAtom, tabData.tabId);
});

export const addSingletonTab = atom(null, (get, set, tabData: TabData) => {
  const tabs = get(editorTabsAtom);
  const indexOfTabType = tabs.findIndex(({ type }) => type === tabData.type);
  if (indexOfTabType === -1) {
    set(editorTabsAtom, (tabs) => [tabData, ...tabs]);
    set(selectedTabIdAtom, tabData.tabId);
  } else {
    set(selectedTabIdAtom, tabs[indexOfTabType].tabId);
  }
});

export const closeTabAtom = atom(null, (_, set, tabIndex: number) => {
  set(editorTabsAtom, (tabs) => {
    const newTabs = tabs.slice();
    newTabs.splice(tabIndex, 1);
    return newTabs;
  });
});

// read-only
export const selectedTabIdAtom = atom<null | string>(null);

export const selectedTab = atom((get) => {
  const selectedTabId = get(selectedTabIdAtom);
  const tabs = get(editorTabsAtom);
  const selectedTab = tabs.find(({ tabId }) => tabId === selectedTabId);
  return selectedTab;
});
