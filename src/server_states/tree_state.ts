import { atom } from "jotai";
import { wsSend } from "../websocket";

export type Tree = {
  id: string;
  children: number;
};

export const baseTreeAtom = atom<null | Tree>(null);
export const treeAtom = atom(
  (get) => get(baseTreeAtom),
  (_, set, newTree: Tree) => {
    wsSend(newTree);
  }
);

// export const useTreeState = () => {
//   const sentRequestRef = useRef(false);
//   const setBaseAtom = useSetAtom(baseAtom);
//   const { lastJsonMessage, sendJsonMessage } = useNewWebSocket("tree", (msg) => msg);

//   useEffect(() => {
//     if (sentRequestRef.current) return;
//     sendJsonMessage({ type: "getTree" });
//     sentRequestRef.current = true;
//   }, []);

//   useEffect(() => {
//     if (!lastJsonMessage) return;

//     setBaseAtom(lastJsonMessage);
//   }, [lastJsonMessage]);
// };
