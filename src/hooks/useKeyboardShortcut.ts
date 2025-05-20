import { useEffect, useCallback } from 'react';

type KeyCombo = string | string[];
type Handler = (event: KeyboardEvent) => void;

interface ShortcutOptions {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export const useKeyboardShortcut = (
  keyCombo: KeyCombo,
  handler: Handler,
  options: ShortcutOptions = {}
) => {
  const {
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    metaKey = false,
    preventDefault = true,
    stopPropagation = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const keys = Array.isArray(keyCombo) ? keyCombo : [keyCombo];
      const key = event.key.toLowerCase();

      const isKeyMatch = keys.some((k) => k.toLowerCase() === key);
      const isModifierMatch =
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey &&
        event.metaKey === metaKey;

      if (isKeyMatch && isModifierMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        handler(event);
      }
    },
    [keyCombo, handler, ctrlKey, shiftKey, altKey, metaKey, preventDefault, stopPropagation]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}; 