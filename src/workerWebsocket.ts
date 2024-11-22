import { useCallback, useEffect, useState } from 'react';
import SocketWorker from '../workers/wsInABox?worker';

const worker = new SocketWorker();
let listening = false;

const listeners = new Map<string, React.Dispatch<React.SetStateAction<null | { [key: string]: any }>>>();

export const useWorkerSocket = (listenerKey: string) => {
  const [lastJsonMessage, setLastJsonMessage] = useState<null | { [key: string]: any }>(null);

  const sendRequest = useCallback((reqBody: any) => {
    worker.postMessage(JSON.stringify(reqBody));
  }, []);

  useEffect(() => {
    if (!listeners.has(listenerKey)) {
      listeners.set(listenerKey, setLastJsonMessage);
    }

    if (!listening) {
      worker.onmessage = (e: MessageEvent) => {
        const msgType: string = e.data.type;
        const setter = listeners.get(msgType);
        setter?.(e.data);
      };
      listening = true;
    }

    return () => {
      listening = false;
      listeners.delete(listenerKey);
    };
  }, []);

  return { lastJsonMessage, sendRequest };
};
