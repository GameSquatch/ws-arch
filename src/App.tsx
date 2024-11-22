import { useCallback, useRef } from 'react';
import './App.css';
import ContextMenu from './context_menu/ContextMenu';
import SetTheme from './SetTheme';
import Tree from './Tree';
import UserPrefs from './UserPrefs';
import WebsocketInit from './WebsocketInit';
import { useSetAtom } from 'jotai';
import { contextMenuAtom } from './context_menu/context_menu_atom';
import { DisplayPropertiesProvider } from './api/display_properties/DisplayPropertiesProvider';
import { useWorkerSocket } from './workerWebsocket';
import Editor from './editors/Editor';
import { addTabAtom } from './editors/editorTabsState';

const useThing = () => {
  const { lastJsonMessage, sendRequest } = useWorkerSocket('tree');
  const sent = useRef(false);

  if (!sent.current) {
    sendRequest({ type: 'getTree' });
    sent.current = true;
  }

  if (lastJsonMessage) {
    console.log(lastJsonMessage);
  }
};

function App() {
  const setContextMenu = useSetAtom(contextMenuAtom);
  const addTab = useSetAtom(addTabAtom);
  // useThing();

  const contextMenuHandler = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const target = e.target as Node;

      setContextMenu({
        type: 'show',
        x: e.clientX,
        y: e.clientY,
        menu: [{ label: target.textContent ?? '', execute: () => console.log(target.textContent) }],
      });
    },
    [setContextMenu]
  );

  const openEditor = useCallback(() => {
    addTab({ label: 'new tab', tabId: crypto.randomUUID(), objectId: crypto.randomUUID(), type: 'placeholder' });
  }, []);

  return (
    // <DisplayPropertiesProvider>
    <div className="app-wrapper">
      {/* <WebsocketInit></WebsocketInit>
      <UserPrefs></UserPrefs> */}
      {/* <SetTheme></SetTheme> */}
      {/* <Tree></Tree> */}
      {/* <div>
        <div onContextMenu={contextMenuHandler}>Node 1</div>
        <div onContextMenu={contextMenuHandler}>Node 2</div>
      </div> */}
      <Editor />
      <button onClick={openEditor}>Open</button>
      <ContextMenu></ContextMenu>
    </div>
    // </DisplayPropertiesProvider>
  );
}

export default App;
