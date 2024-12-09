import { TabData } from './editorTabsState';

const PlaceholderEditor = (props: Partial<TabData>) => {
  const { objectId } = props;
  return <div>Placeholder: {objectId}</div>;
};

export default PlaceholderEditor;
