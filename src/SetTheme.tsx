import { useSetAtom } from "jotai";
import { userPrefsAtom } from "./server_states/user_preferences";


const SetTheme = () => {
    const userPrefsDispatch = useSetAtom(userPrefsAtom);
    // console.log('run set theme');

    return (
        <div>
            <button onClick={() => userPrefsDispatch({ type: 'set-theme', theme: 'barbie' })}>Set Theme</button>
        </div>
    )
};

export default SetTheme;