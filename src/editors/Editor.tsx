import { useMemo } from 'react';
import './Editor.css';
import { editorComponentsMap } from './editorComponentsMap';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { editorTabsAtom, selectedTabIdAtom, closeTabAtom } from './editorTabsState';

const Editor = () => {
  const tabs = useAtomValue(editorTabsAtom);
  const [selectedTabId, setSelectedTabId] = useAtom(selectedTabIdAtom);
  const selectedTab = useMemo(() => tabs.find(({ tabId }) => tabId === selectedTabId), [tabs, selectedTabId]);
  const closeTab = useSetAtom(closeTabAtom);
  const EditorView = selectedTab ? editorComponentsMap[selectedTab.type] : 'div';

  const handleCloseTab = (e: React.MouseEvent<HTMLSpanElement>, tabIndex: number) => {
    e.stopPropagation();
    closeTab(tabIndex);
  };

  const handleSelectTab = (tabId: string) => {
    if (tabId !== selectedTabId) {
      setSelectedTabId(tabId);
    }
  };

  const editorTabElements = useMemo(() => {
    return tabs.map(({ tabId, label }, i) => {
      const isSelected = selectedTabId === tabId;
      const classes = `editor-tab ${isSelected ? 'selected' : ''}`;
      return (
        <div key={tabId} onClick={(_) => handleSelectTab(tabId)} className={classes}>
          {label}
          <span className="tab-closer" onClick={(e) => handleCloseTab(e, i)}>
            X
          </span>
        </div>
      );
    });
  }, [tabs, selectedTabId]);

  return (
    <div className="editor-wrapper">
      <div className="editor-tabs-wrapper">{editorTabElements}</div>
      <div className="editor-view-wrapper">
        <EditorView objectId={selectedTab?.objectId} />
      </div>
    </div>
  );
};

export default Editor;
