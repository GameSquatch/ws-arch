import { useAtom } from "jotai";
import { treeAtom } from "./server_states/tree_state";
import { useCallback } from "react";

const Tree = () => {
  const [tree, setTree] = useAtom(treeAtom);

  const setChildren = useCallback(() => {
    if (!tree) return;
    const newChildren = Math.floor(Math.random() * 20);
    setTree({ ...tree, children: newChildren });
  }, [tree]);

  return (
    <div>
      <p>Id: {tree?.id}</p>
      <p>Children: {tree?.children}</p>
      <div>
        <button onClick={setChildren}>Set Children</button>
      </div>
    </div>
  );
};

export default Tree;
