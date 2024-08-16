import { useAtom } from "jotai";
import { userPrefsAtom } from "./server_states/user_preferences.js";

const UserPrefs = () => {
  const [userPreferences, userPrefsDispatch] = useAtom(userPrefsAtom);

  return (
    <>
      <div>
        <span>Mode: </span>
        <span>{userPreferences.mode}</span>
      </div>
      <div>
        <span>Theme: </span>
        <span>{userPreferences.theme}</span>
      </div>
      <div>
        <span>Typeface: </span>
        <span>{userPreferences.typeface}</span>
      </div>
      <div>
        <button onClick={() => userPrefsDispatch({ type: "set-mode", mode: Math.floor(Math.random() * 100) })}>
          Change Mode
        </button>
      </div>
    </>
  );
};

export default UserPrefs;
