import { memo } from 'react';
import TypedInput from './TypedInput';

interface FieldRendererProps {
  fieldDataType: 'IDS_STRING' | 'IDS_NUMBER' | 'IDS_DATETIME' | 'IDS_BOOLEAN' | 'ENUM' | 'KEY';
  hasAllowedValues: boolean;
}

const FieldRenderer = memo(({ fieldDataType, hasAllowedValues }: FieldRendererProps) => {
  let renderedResult;

  if (fieldDataType === 'ENUM' || hasAllowedValues) {
    return <select></select>;
  }

  switch (fieldDataType) {
    case 'IDS_STRING':
      renderedResult = <TypedInput type="text"></TypedInput>;
      break;
    case 'IDS_NUMBER':
      // <AlphaNumericInput></AlphaNumericInput>
      renderedResult = <TypedInput type="number"></TypedInput>;
      break;
    case 'IDS_BOOLEAN':
      renderedResult = <TypedInput type="checkbox"></TypedInput>;
      break;
    case 'IDS_DATETIME':
      renderedResult = <TypedInput type="datetime-local"></TypedInput>;
      break;
    case 'KEY':
      renderedResult = <input></input>;
      break;
  }

  return renderedResult;
});

export default FieldRenderer;
