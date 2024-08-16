import { atom, useSetAtom } from "jotai";
import { useNewWebSocket, wsSend } from "../websocket";
import { useEffect, useRef } from "react";

type Tree = {
  id: string;
  children: number;
};

const baseAtom = atom<null | Tree>(null);
export const treeAtom = atom(
  (get) => get(baseAtom),
  (_, set, newTree: Tree) => {
    wsSend(newTree);
  }
);

export const useTreeState = () => {
  const sentRequestRef = useRef(false);
  const setBaseAtom = useSetAtom(baseAtom);
  const { lastJsonMessage, sendJsonMessage } = useNewWebSocket("tree", (msg) => msg);

  useEffect(() => {
    if (sentRequestRef.current) return;
    sendJsonMessage({ type: "getTree" });
    sentRequestRef.current = true;
  }, []);

  useEffect(() => {
    if (!lastJsonMessage) return;

    setBaseAtom(lastJsonMessage);
  }, [lastJsonMessage]);
};
