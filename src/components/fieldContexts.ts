import { createContext } from 'react';

type TypedInputContextualProps = {
  onValueUpdateNeeded: (newValue: string | number | boolean) => void;
  serverValue: string | number | boolean;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export const FieldContext = createContext<TypedInputContextualProps>({
  onValueUpdateNeeded: () => {},
  serverValue: '',
});
