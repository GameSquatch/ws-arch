import { useDisplayProperties } from './display_properties';

export function DisplayPropertiesProvider({ children }: { children: React.ReactElement }) {
  useDisplayProperties();

  return <>{children}</>;
}
