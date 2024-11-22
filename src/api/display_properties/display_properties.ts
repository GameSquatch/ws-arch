import { useRef } from 'react';
import { useNewWebSocket } from '../../websocket';
import { displayPropertiesAtom, DisplayProperty } from './display_properties_atom';
import { useSetAtom } from 'jotai';

export function useDisplayProperties() {
  const { lastJsonMessage, sendJsonMessage } = useNewWebSocket<
    DisplayProperty,
    { id: string; type: 'displayProperties'; data: DisplayProperty }
  >('displayProperties', (msg) => msg.data);
  const setDisplayProperties = useSetAtom(displayPropertiesAtom);
  const sentRequestRef = useRef(false);

  if (!sentRequestRef.current) {
    sendJsonMessage({ type: 'displayProperties' });
    sentRequestRef.current = true;
  }

  if (lastJsonMessage) {
    setDisplayProperties(lastJsonMessage);
  }
}
