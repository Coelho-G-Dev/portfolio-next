"use client";

import { createContext, useContext } from "react";
import type { SiteCopy } from "@/lib/i18n/site";

export const SiteCopyContext = createContext<SiteCopy | null>(null);

export function useSiteCopy(): SiteCopy {
  const c = useContext(SiteCopyContext);
  if (!c) throw new Error("useSiteCopy precisa estar dentro de <SitePage>");
  return c;
}
