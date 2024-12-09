import { createContext, useMemo } from 'react';
import { useNewWebSocket } from '../websocket';

interface DisplayPropertiesChannelProps {
  children: React.ReactElement;
}

interface DisplayProperty {
  type: 'displayProperties';
  id: string;
  attributes: {
    stuff: string;
  };
}

const DisplayPropertiesContext = createContext<Record<string, DisplayProperty> | null>(null);

const useDisplayProperties = () => {
  const { lastJsonMessage } = useNewWebSocket<DisplayProperty>('displayProperties');
  const data = useMemo(() => {
    if (!lastJsonMessage) return null;
    return lastJsonMessage.reduce<Record<string, DisplayProperty>>((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
  }, [lastJsonMessage]);
  return data;
};

const DisplayPropertiesChannel = ({ children }: DisplayPropertiesChannelProps) => {
  const displayProperties = useDisplayProperties();

  return (
    <DisplayPropertiesContext.Provider value={displayProperties}>
      {displayProperties && children}
    </DisplayPropertiesContext.Provider>
  );
};
