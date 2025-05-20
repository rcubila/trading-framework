import React from 'react';

interface KeyboardShortcutProps {
  keys: string[];
  className?: string;
}

export const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({ keys, className = '' }) => {
  const formatKey = (key: string) => {
    const keyMap: Record<string, string> = {
      ctrl: '⌃',
      shift: '⇧',
      alt: '⌥',
      meta: '⌘',
      enter: '↵',
      escape: '⎋',
      backspace: '⌫',
      tab: '⇥',
      space: '␣',
      arrowup: '↑',
      arrowdown: '↓',
      arrowleft: '←',
      arrowright: '→',
    };

    return keyMap[key.toLowerCase()] || key.toUpperCase();
  };

  return (
    <kbd
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-mono
                 bg-background-secondary text-text-secondary rounded-md
                 border border-border-light ${className}`}
    >
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <span className="px-1 py-0.5 bg-background-primary rounded">
            {formatKey(key)}
          </span>
          {index < keys.length - 1 && <span>+</span>}
        </React.Fragment>
      ))}
    </kbd>
  );
}; 