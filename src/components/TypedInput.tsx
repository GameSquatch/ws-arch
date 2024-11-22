import { useCallback, useContext, useMemo, useState } from 'react';
import { FieldContext } from './fieldContexts';

function TypedInput({ type }: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
  const { serverValue, onValueUpdateNeeded } = useContext(FieldContext);
  const [inputValue, setInputValue] = useState(serverValue);

  const changeHandler = useCallback(
    (e: React.ChangeEvent) => {
      setInputValue((e.target as HTMLInputElement).value);
    },
    [setInputValue]
  );

  useMemo(() => {
    if (serverValue !== inputValue) {
      setInputValue(serverValue);
    }
  }, [serverValue]);

  let checked;
  if (type === 'checkbox') {
    checked = inputValue as boolean;
  }

  return type === 'checkbox' ? (
    <input type="checkbox" checked={inputValue as boolean} onChange={changeHandler}></input>
  ) : (
    <input type={type} value={inputValue as string | number} onChange={changeHandler}></input>
  );
}

export default TypedInput;
