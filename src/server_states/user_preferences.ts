import { useEffect, useRef } from "react";
import { atomWithStorage } from "jotai/utils";
import { atom, useAtom } from "jotai";

import { createLocalStorageConfig } from "./local_storage_config.js";
import { useNewWebSocket, wsSend } from "../websocket.js";

export type UserPreferences = {
  version: number;
  mode: number;
  theme: string;
  typeface: string;
};

type UserPreferencesMessage =
  | ({
      type: "userPreferences";
    } & UserPreferences)
  | {
      type: "getUserPreferences";
    };

export type UserPreferencesAction =
  | {
      type: "set-mode";
      mode: UserPreferences["mode"];
    }
  | {
      type: "set-theme";
      theme: UserPreferences["theme"];
    }
  | {
      type: "set-server";
      newState: UserPreferences;
    };

const migrate = (defaultValue: any, storedState: any) => {
  const result = { ...defaultValue, ...storedState };
  // added a new field 'font'
  if (defaultValue.version === 2 && storedState.version < 2) {
    result.font = defaultValue.font;
  }
  // changed name of field 'font' to 'typeface'
  if (defaultValue.version === 3 && storedState.version < 3) {
    result.typeface = storedState.font ?? defaultValue.typeface;
    delete result.font;
  }

  if (defaultValue.version >= 4 && storedState.version < 4) {
    delete result.clientId;
  }
  return result;
};

const baseAtom = atomWithStorage<UserPreferences>(
  "userPreferences",
  {
    version: 4,
    mode: 1,
    theme: "mint-chocolate",
    typeface: "times",
  },
  createLocalStorageConfig<UserPreferences>(migrate),
  { getOnInit: true }
);

export const userPrefsAtom = atom(
  (get) => get(baseAtom),
  (get, set, action: UserPreferencesAction) => {
    const newState = userPrefsReducer(action, get(baseAtom));
    set(baseAtom, newState);
  }
);

const userPrefsReducer = (action: UserPreferencesAction, currentState: UserPreferences) => {
  let newState;
  switch (action.type) {
    case "set-mode":
      newState = { ...currentState, mode: action.mode };
      break;
    case "set-theme":
      newState = { ...currentState, theme: action.theme };
      break;
    case "set-server":
      // don't send since it came from server
      return action.newState;
  }
  wsSend({ type: "userPreferences", ...newState });
  return newState;
};

export const useUserPreferencesState = () => {
  const [userPrefs, dispatcher] = useAtom(userPrefsAtom);
  const sentRequestRef = useRef(false);

  const { lastJsonMessage, sendJsonMessage } = useNewWebSocket<UserPreferences>("userPreferences", (msg) => msg);

  useEffect(() => {
    if (sentRequestRef.current) return;
    sendJsonMessage({ type: "getUserPreferences" });
    sentRequestRef.current = true;
  }, []);

  useEffect(() => {
    if (!lastJsonMessage) return;

    let serverMigrated;
    if (lastJsonMessage.version < userPrefs.version) {
      // A migration occurred, so update server with migrated value
      // If an edit to the server occurred on another machine, we need to set this machine's local to those changed server values,
      // so we migrate between local and server before updating the server and state with that
      serverMigrated = migrate(userPrefs, lastJsonMessage);
      sendJsonMessage({ type: "userPreferences", ...serverMigrated });
    }
    dispatcher({
      type: "set-server",
      newState: serverMigrated ?? lastJsonMessage,
    });
  }, [lastJsonMessage]);
};
