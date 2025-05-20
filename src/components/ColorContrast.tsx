import React from 'react';
import { AnimatedElement } from './AnimatedElement';

interface ColorContrastProps {
  backgroundColor: string;
  textColor: string;
  children: React.ReactNode;
  className?: string;
  minContrastRatio?: number;
}

export const ColorContrast: React.FC<ColorContrastProps> = ({
  backgroundColor,
  textColor,
  children,
  className = '',
  minContrastRatio = 4.5, // WCAG AA standard for normal text
}) => {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Calculate contrast ratio
  const getContrastRatio = (l1: number, l2: number) => {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  // Check if colors meet contrast requirements
  const checkContrast = () => {
    const bgRgb = hexToRgb(backgroundColor);
    const textRgb = hexToRgb(textColor);

    if (!bgRgb || !textRgb) return false;

    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const textLuminance = getLuminance(textRgb.r, textRgb.g, textRgb.b);
    const contrastRatio = getContrastRatio(bgLuminance, textLuminance);

    return contrastRatio >= minContrastRatio;
  };

  const hasAdequateContrast = checkContrast();

  return (
    <AnimatedElement
      show={true}
      animation="fadeIn"
      className={`relative ${className}`}
    >
      {children}
      {!hasAdequateContrast && (
        <div className="absolute top-0 right-0 p-2 bg-warning/10 text-warning text-xs rounded-bl">
          Low contrast detected
        </div>
      )}
    </AnimatedElement>
  );
}; 