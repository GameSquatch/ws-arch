import { useMemo } from 'react';
import './Editor.css';
import { editorComponentsMap } from './editorComponentsMap';
import { useAtom, useAtomValue } from 'jotai';
import { editorTabsAtom, selectedTabIdAtom } from './editorTabsState';

const Editor = () => {
  const tabs = useAtomValue(editorTabsAtom);
  const [selectedTabId, setSelectedTabId] = useAtom(selectedTabIdAtom);
  const selectedTab = useMemo(() => tabs.find(({ tabId }) => tabId === selectedTabId), [tabs, selectedTabId]);

  const EditorView = selectedTab ? editorComponentsMap[selectedTab.type] : 'div';

  const clickTabHandler = (tabId: string) => {
    if (tabId !== selectedTabId) {
      setSelectedTabId(tabId);
    }
  };

  const editorTabElements = useMemo(() => {
    return tabs.map(({ tabId, label }) => {
      const isSelected = selectedTabId === tabId;
      const classes = `editor-tab ${isSelected ? 'selected' : ''}`;
      return (
        <div key={tabId} onClick={(_) => clickTabHandler(tabId)} className={classes}>
          {label}
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
