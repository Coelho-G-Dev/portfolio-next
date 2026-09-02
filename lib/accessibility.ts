
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');

  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16)
    };
  }

  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16)
  };
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function checkContrastCompliance(
  foreground: string,
  background: string,
  isLargeText = false
): {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
  passesAA: boolean;
  passesAAA: boolean;
  status: 'AAA' | 'AA' | 'FAIL';
} {
  const ratio = getContrastRatio(foreground, background);
  const aaTarget = isLargeText ? 3 : 4.5;
  const aaaTarget = isLargeText ? 4.5 : 7;
  const passesAA = ratio >= aaTarget;
  const passesAAA = ratio >= aaaTarget;

  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
    passesAA,
    passesAAA,
    status: passesAAA ? 'AAA' : passesAA ? 'AA' : 'FAIL',
  };
}

export function getContrastWarning(
  compliance: ReturnType<typeof checkContrastCompliance>,
  isLargeText = false
): string | null {
  const { ratio, passesAA } = compliance;

  if (!passesAA) {
    return `Ratio de contraste ${ratio.toFixed(2)}:1 está abaixo do mínimo WCAG AA (requer ${isLargeText ? '3:1' : '4.5:1'}).`;
  }

  return null; // Conforme com WCAG AA
}

export function calculateEffectiveColor(
  overlayColor: string,
  backgroundColor: string,
  overlayAlpha: number
): string {
  const overlayRgb = hexToRgb(overlayColor);
  const backgroundRgb = hexToRgb(backgroundColor);

  const effectiveR = Math.round(
    overlayRgb.r * overlayAlpha + backgroundRgb.r * (1 - overlayAlpha)
  );
  const effectiveG = Math.round(
    overlayRgb.g * overlayAlpha + backgroundRgb.g * (1 - overlayAlpha)
  );
  const effectiveB = Math.round(
    overlayRgb.b * overlayAlpha + backgroundRgb.b * (1 - overlayAlpha)
  );

  const toHex = (n: number): string => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(effectiveR)}${toHex(effectiveG)}${toHex(effectiveB)}`;
}

export function getContrastSuggestion(
  foreground: string,
  background: string,
  ratio: number,
  isLargeText = false,
  targetRatio?: number
): string | null {
  if (targetRatio === undefined) {
    targetRatio = isLargeText ? 3 : 4.5;
  }

  if (ratio >= targetRatio) {
    return null;
  }

  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const isFgLighter = fgLum > bgLum;

  const currentDiff = Math.abs(fgLum - bgLum);
  const targetDiff = targetRatio * 0.05 - 0.05; // Derived from contrast ratio formula

  let suggestion: string;
  if (isFgLighter) {
    suggestion = `Consider darkening the text color`;
  } else {
    suggestion = `Consider lightening the text color`;
  }

  return `${suggestion} to achieve a contrast ratio of at least ${targetRatio.toFixed(1)}:1`;
}

export const siteColors = {
  navy: "#12222D",
  cream: "#F2EADC",
  lime: "#EAF35B",
  orange: "#E97C67",
  blue: "#2E53E5",
  lavender: "#B997FF"
} as const;