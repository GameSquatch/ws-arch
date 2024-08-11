import { useMemo } from "react";
import useWebsocket, { Options } from "react-use-websocket";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";

export let wsSend: SendJsonMessage;

export const useZootWebSocket = <StateType, SendMessageType>(
  filter?: Options["filter"]
) => {
  const { lastJsonMessage, sendJsonMessage } = useWebsocket<
    StateType & { clientId: string }
  >("ws://localhost:5174", {
    share: true,
    shouldReconnect: (_) => true,
    reconnectAttempts: 5,
    reconnectInterval: (tryNumber) => 1000 * (tryNumber * tryNumber),
    filter,
  });

  wsSend = sendJsonMessage;

  const result = useMemo(
    () => ({
      lastJsonMessage,
      sendJsonMessage: sendJsonMessage as (data: SendMessageType) => void,
    }),
    [lastJsonMessage, sendJsonMessage]
  );

  return result;
};
