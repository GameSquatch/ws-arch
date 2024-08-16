import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useWebsocket, { Options } from "react-use-websocket";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";

export let wsSend: SendJsonMessage;

export const useZootWebSocket = <StateType, SendMessageType>(filter?: Options["filter"]) => {
  const { lastJsonMessage, sendJsonMessage } = useWebsocket<StateType>("ws://localhost:5174", {
    share: true,
    shouldReconnect: (_) => true,
    reconnectAttempts: 5,
    reconnectInterval: (tryNumber) => 1000 * (tryNumber * tryNumber),
    filter,
  });

  wsSend = sendJsonMessage;

  const result = useMemo(
    () => ({
      lastJsonMessage,
      sendJsonMessage: sendJsonMessage as (data: SendMessageType) => void,
    }),
    [lastJsonMessage, sendJsonMessage]
  );

  return result;
};

type SocketListener = {
  key: string;
  setJsonMessage: React.Dispatch<React.SetStateAction<any>>;
  messageQueue: React.MutableRefObject<any[]>;
};

let listeners: Record<string, SocketListener> = {};
const hasListeners = () => Object.keys(listeners).length > 0;
const getListeners = () => Object.values(listeners);
let ws: null | WebSocket = null;

export const useNewWebSocket = <StateType>(typeKey: string, dataExtractor: (message: any) => StateType) => {
  const [lastJsonMessage, setLastJsonMessage] = useState<null | StateType>(null);
  const wsRef = useRef<null | WebSocket>(null);
  const messageQueueRef = useRef<any[]>([]);
  const reconnectCountRef = useRef(0);

  const sendJsonMessage = useCallback((jsonMsg: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(jsonMsg));
    } else {
      messageQueueRef.current.push(jsonMsg);
    }
  }, []);

  useEffect(() => {
    const init = () => {
      if (ws ?? false) {
        wsRef.current = ws;
      } else {
        wsSend = sendJsonMessage;
        ws = new WebSocket("http://localhost:5174");
        wsRef.current = ws;

        ws.onopen = (_) => {
          reconnectCountRef.current = 0;
          getListeners().forEach((listener) => {
            if (listener.messageQueue.current.length > 0) {
              [...listener.messageQueue.current].forEach(sendJsonMessage);
              listener.messageQueue.current = [];
            }
          });
        };

        ws.onmessage = (e) => {
          try {
            const jsonMsg = JSON.parse(e.data);
            listeners[jsonMsg.type].setJsonMessage(jsonMsg);
          } catch (err) {
            console.error("Failed to parse ws message: ", err);
          }
        };

        ws.onclose = (e) => {
          ws = null;
          if (reconnectCountRef.current < 8) {
            reconnectCountRef.current++;
            window.setTimeout(init, 1000);
          } else {
            console.warn("Reach max attempts to reconnect");
          }
        };
      }
    };

    const newListener: SocketListener = {
      key: typeKey,
      setJsonMessage: setLastJsonMessage,
      messageQueue: messageQueueRef,
    };

    listeners[typeKey] = newListener;

    init();

    return () => {
      delete listeners[typeKey];
      if (!hasListeners() && ws) {
        ws.onclose = () => {};
        ws.close();
        ws = null;
      }
      setLastJsonMessage(null);
    };
  }, []);

  return {
    lastJsonMessage,
    sendJsonMessage,
  };
};
