'use client';

import { useEffect, useRef } from 'react';

/**
 * Avisa antes de perder el avance de una clase en curso: intercepta clicks en
 * links internos y el cierre/recarga de la pestaña mientras `active` es true.
 */
export function useLeaveConfirm(active: boolean, message: string) {
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!activeRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    }

    function handleClick(e: MouseEvent) {
      if (!activeRef.current) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (!window.confirm(message)) {
        e.preventDefault();
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [message]);
}
