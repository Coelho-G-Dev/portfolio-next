"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { EMAIL } from "@/lib/contact";
import type { Surface } from "./Pill";
import { useSiteCopy } from "./SiteCopyContext";

type CopyState = "idle" | "copied" | "failed";

const MESSAGE_MS = 2500;

// O endereço é um link mailto que funciona sem JavaScript; o botão ao lado
// copia o endereço e anuncia o resultado numa região role="status".
export default function EmailPill({ surface }: { surface: Surface }) {
  const c = useSiteCopy().hero;
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function onCopy() {
    const ok = await copyText(EMAIL);
    setState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), MESSAGE_MS);
  }

  const message = state === "copied" ? c.copied : state === "failed" ? c.copyFailed : "";

  return (
    <div className="s-email" data-surface={surface}>
      <a className="s-email__address" href={`mailto:${EMAIL}`}>
        {EMAIL}
      </a>
      <button type="button" className="s-email__copy" onClick={onCopy} aria-label={c.copyEmail}>
        {state === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      </button>
      <span className="s-email__msg" role="status" data-state={state}>
        {message}
      </span>
    </div>
  );
}
