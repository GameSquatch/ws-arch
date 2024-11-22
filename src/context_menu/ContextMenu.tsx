import './ContextMenu.css';
import { contextMenuAtom } from './context_menu_atom';

import { useAtom } from 'jotai';
import { useEffect, useMemo, useRef } from 'react';

const ContextMenu = () => {
  const [contextMenu, setContextMenu] = useAtom(contextMenuAtom);
  const top = `${contextMenu.position.y}px`;
  const left = `${contextMenu.position.x}px`;
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Click away to dismiss
  useEffect(() => {
    const clickAwayHandler = (e: MouseEvent) => {
      if (contextMenuRef.current && contextMenuRef.current.contains(e.target as Node)) {
        return;
      }
      setContextMenu({ type: 'hide' });
    };

    window.addEventListener('click', clickAwayHandler);

    return () => {
      window.removeEventListener('click', clickAwayHandler);
    };
  }, []);

  const menuItems = useMemo(() => {
    return contextMenu.menu.map((menuItem) => {
      return (
        <div key={crypto.randomUUID()} className="menu-item" onClick={menuItem.execute}>
          {menuItem.label}
        </div>
      );
    });
  }, [contextMenu.menu]);

  return !contextMenu.showing ? null : (
    <div className="context-menu" style={{ top, left }} ref={contextMenuRef}>
      {menuItems}
    </div>
  );
};

export default ContextMenu;
