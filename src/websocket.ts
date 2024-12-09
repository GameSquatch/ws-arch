import useWebsocket from 'react-use-websocket';
import { SendJsonMessage } from 'react-use-websocket/dist/lib/types';
import { migrateUserPrefs, UserPreferences, userPrefsAtom } from './server_states/user_preferences';
import { getDefaultStore } from 'jotai';
import { baseTreeAtom, Tree } from './server_states/tree_state';
import { useCallback, useEffect, useRef, useState } from 'react';

export let wsSend: SendJsonMessage;

export const useZootWebSocket = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebsocket<any>('ws://localhost:5174', {
    share: true,
    shouldReconnect: (_) => true,
    reconnectAttempts: 5,
    reconnectInterval: (tryNumber) => 1000 * (tryNumber * tryNumber),
    onOpen: (_) => {
      sendJsonMessage({ type: 'getUserPreferences' });
      sendJsonMessage({ type: 'getTree' });
    },
  });

  wsSend = sendJsonMessage;

  useEffect(() => {
    if (lastJsonMessage === null) return;

    switch (lastJsonMessage.type) {
      case 'userPreferences':
        wsUserPrefsMessageHandler(lastJsonMessage, sendJsonMessage);
        break;
      case 'tree':
        wsTreeMessageHandler(lastJsonMessage, sendJsonMessage);
        break;
      default:
        break;
    }
  }, [lastJsonMessage]);
};

const wsTreeMessageHandler = (lastJsonMessage: Tree, _: SendJsonMessage) => {
  getDefaultStore().set(baseTreeAtom, lastJsonMessage);
};

const wsUserPrefsMessageHandler = (lastJsonMessage: UserPreferences, sendJsonMessage: SendJsonMessage) => {
  const store = getDefaultStore();
  const userPrefsState = store.get(userPrefsAtom);

  let serverMigrated;
  if (lastJsonMessage.version < userPrefsState.version) {
    // A migration occurred, so update server with migrated value
    // If an edit to the server occurred on another machine, we need to set this machine's local to those changed server values,
    // so we migrate between local and server before updating the server and state with that
    serverMigrated = migrateUserPrefs(userPrefsState, lastJsonMessage);
    sendJsonMessage({ type: 'userPreferences', ...serverMigrated });
  }
  store.set(userPrefsAtom, {
    type: 'set-server',
    newState: serverMigrated ?? lastJsonMessage,
  });
};

type SocketListener = {
  key: string;
  setJsonMessage: React.Dispatch<React.SetStateAction<any>>;
  wsRef: React.MutableRefObject<WebSocket | null>;
};

let listeners: Record<string, SocketListener> = {};
const getListeners = () => Object.values(listeners);
let ws: null | WebSocket = null;
let messageQueue: any[] = [];
type MessageType<TState> = { data: TState[] };

export const useNewWebSocket = <TState extends { type: string }>(typeKey: string) => {
  const [lastJsonMessage, setLastJsonMessage] = useState<null | TState[]>(null);
  const wsRef = useRef<null | WebSocket>(null);

  const sendJsonMessage = useCallback((jsonMsg: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(jsonMsg));
    } else {
      messageQueue.push(jsonMsg);
    }
  }, []);

  wsSend = sendJsonMessage;

  useEffect(() => {
    if (ws && !wsRef.current) {
      wsRef.current = ws;
    } else if (!ws) {
      ws = new WebSocket('http://localhost:5174');
      wsRef.current = ws;

      ws.onopen = (_) => {
        if (messageQueue.length > 0) {
          messageQueue.forEach(sendJsonMessage);
          messageQueue = [];
        }
      };

      ws.onmessage = (e) => {
        try {
          const jsonMsg = JSON.parse(e.data) as MessageType<TState>;
          listeners[jsonMsg.data[0].type].setJsonMessage(jsonMsg);
        } catch (err) {
          console.error('Failed to parse ws message: ', err);
        }
      };

      ws.onclose = (e) => {
        ws = null;
        getListeners().forEach((listener) => {
          listener.wsRef.current = null;
        });
      };
    }

    const newListener: SocketListener = {
      key: typeKey,
      setJsonMessage: setLastJsonMessage,
      wsRef: wsRef,
    };

    listeners[typeKey] = newListener;

    return () => {
      delete listeners[typeKey];
    };
  }, []);

  return {
    lastJsonMessage,
    sendJsonMessage,
  };
};
