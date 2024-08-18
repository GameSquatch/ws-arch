import useWebsocket from "react-use-websocket";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { migrateUserPrefs, UserPreferences, userPrefsAtom } from "./server_states/user_preferences";
import { getDefaultStore } from "jotai";
import { baseTreeAtom, Tree } from "./server_states/tree_state";
import { useEffect } from "react";

export let wsSend: SendJsonMessage;

export const useZootWebSocket = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebsocket<any>("ws://localhost:5174", {
    share: true,
    shouldReconnect: (_) => true,
    reconnectAttempts: 5,
    reconnectInterval: (tryNumber) => 1000 * (tryNumber * tryNumber),
    onOpen: (_) => {
      sendJsonMessage({ type: "getUserPreferences" });
      sendJsonMessage({ type: "getTree" });
    },
  });

  wsSend = sendJsonMessage;

  useEffect(() => {
    if (lastJsonMessage === null) return;

    switch (lastJsonMessage.type) {
      case "userPreferences":
        wsUserPrefsMessageHandler(lastJsonMessage, sendJsonMessage);
        break;
      case "tree":
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
    sendJsonMessage({ type: "userPreferences", ...serverMigrated });
  }
  store.set(userPrefsAtom, {
    type: "set-server",
    newState: serverMigrated ?? lastJsonMessage,
  });
};

// type SocketListener = {
//   key: string;
//   setJsonMessage: React.Dispatch<React.SetStateAction<any>>;
//   messageQueue: React.MutableRefObject<any[]>;
// };

// let listeners: Record<string, SocketListener> = {};
// const hasListeners = () => Object.keys(listeners).length > 0;
// const getListeners = () => Object.values(listeners);
// let ws: null | WebSocket = null;

// export const useNewWebSocket = <StateType>(typeKey: string, dataExtractor: (message: any) => StateType) => {
//   const [lastJsonMessage, setLastJsonMessage] = useState<null | StateType>(null);
//   const wsRef = useRef<null | WebSocket>(null);
//   const messageQueueRef = useRef<any[]>([]);
//   const reconnectCountRef = useRef(0);

//   const sendJsonMessage = useCallback((jsonMsg: any) => {
//     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify(jsonMsg));
//     } else {
//       messageQueueRef.current.push(jsonMsg);
//     }
//   }, []);

//   useEffect(() => {
//     const init = () => {
//       if (ws ?? false) {
//         wsRef.current = ws;
//       } else {
//         wsSend = sendJsonMessage;
//         ws = new WebSocket("http://localhost:5174");
//         wsRef.current = ws;

//         ws.onopen = (_) => {
//           reconnectCountRef.current = 0;
//           getListeners().forEach((listener) => {
//             if (listener.messageQueue.current.length > 0) {
//               [...listener.messageQueue.current].forEach(sendJsonMessage);
//               listener.messageQueue.current = [];
//             }
//           });
//         };

//         ws.onmessage = (e) => {
//           try {
//             const jsonMsg = JSON.parse(e.data);
//             listeners[jsonMsg.type].setJsonMessage(jsonMsg);
//           } catch (err) {
//             console.error("Failed to parse ws message: ", err);
//           }
//         };

//         ws.onclose = (e) => {
//           ws = null;
//           if (reconnectCountRef.current < 8) {
//             reconnectCountRef.current++;
//             window.setTimeout(init, 1000);
//           } else {
//             console.warn("Reach max attempts to reconnect");
//           }
//         };
//       }
//     };

//     const newListener: SocketListener = {
//       key: typeKey,
//       setJsonMessage: setLastJsonMessage,
//       messageQueue: messageQueueRef,
//     };

//     listeners[typeKey] = newListener;

//     init();

//     return () => {
//       delete listeners[typeKey];
//       if (!hasListeners() && ws) {
//         ws.onclose = () => {};
//         ws.close();
//         ws = null;
//       }
//       setLastJsonMessage(null);
//     };
//   }, []);

//   return {
//     lastJsonMessage,
//     sendJsonMessage,
//   };
// };
