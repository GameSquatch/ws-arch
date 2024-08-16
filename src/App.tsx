import "./App.css";
import SetTheme from "./SetTheme";
import Tree from "./Tree";
import UserPrefs from "./UserPrefs";
import WebsocketInit from "./WebsocketInit";

function App() {
  return (
    <>
      <WebsocketInit></WebsocketInit>
      <UserPrefs></UserPrefs>
      {/* <SetTheme></SetTheme>
      <Tree></Tree> */}
    </>
  );
}

export default App;
