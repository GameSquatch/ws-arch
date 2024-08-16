import { SyncStorage } from "jotai/vanilla/utils/atomWithStorage";

export const createLocalStorageConfig = <StateType>(
  migrate: (defaultValue: any, storedValue: any) => StateType
): SyncStorage<StateType & { version: number }> => {
  return {
    getItem(key, defaultValue) {
      const stored = localStorage.getItem(key);
      if (!stored) {
        return defaultValue;
      }

      let storedParsed;
      try {
        storedParsed = JSON.parse(stored);
      } catch (_) {
        console.error("Locally stored data not JSON compliant", stored);
        return defaultValue;
      }

      if (storedParsed.version < defaultValue.version) {
        const result = migrate(defaultValue, storedParsed);

        localStorage.setItem(key, JSON.stringify({ ...result, version: defaultValue.version }));
        return result;
      }
      return storedParsed;
    },
    setItem(key, newValue) {
      localStorage.setItem(key, JSON.stringify(newValue));
    },
    removeItem(key: string) {
      localStorage.removeItem(key);
    },
  };
};
