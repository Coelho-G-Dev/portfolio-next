"use client";

import { createContext, useContext } from "react";

// Capítulos cobertos pela Cortina (cobertura ≥ COVERED_AT).
export const CortinaContext = createContext<ReadonlySet<string>>(new Set());

export function useChapterCovered(id: string): boolean {
  return useContext(CortinaContext).has(id);
}
