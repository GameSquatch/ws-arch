import { useUserPreferencesState } from './server_states/user_preferences';

function WebsocketInit() {
    useUserPreferencesState();

    return <div hidden></div>;
}

export default WebsocketInit;