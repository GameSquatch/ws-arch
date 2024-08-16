import { useTreeState } from "./server_states/tree_state";
import { useUserPreferencesState } from "./server_states/user_preferences";

function WebsocketInit() {
  useUserPreferencesState();
  // useTreeState();

  return <div hidden></div>;
}

export default WebsocketInit;
