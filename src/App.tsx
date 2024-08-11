import "./App.css";
import SetTheme from "./SetTheme";
import UserPrefs from "./UserPrefs";
import WebsocketInit from "./WebsocketInit";

function App() {
  return (
    <>
      <WebsocketInit></WebsocketInit>
      <UserPrefs></UserPrefs>
      <SetTheme></SetTheme>
    </>
  );
}

export default App;
