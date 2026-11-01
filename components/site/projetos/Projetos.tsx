"use client";

import { useEffect, useRef, useState } from "react";
import type { Door } from "@/data/projects";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "../Chapter";
import { useSiteCopy } from "../SiteCopyContext";
import DoorPanel from "./DoorPanel";
import Doors, { DOOR_ORDER } from "./Doors";
import Featured from "./Featured";

const OPEN_DELAY_MS = 450;

function isReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function Projetos({ lang: langProp }: { lang?: "pt" | "en" }) {
  const { language } = useLanguage();
  const lang = langProp ?? language;
  const c = useSiteCopy().projetos;

  const [mounted, setMounted] = useState(false);
  const [openingDoor, setOpeningDoor] = useState<Door | null>(null);
  const [activeDoor, setActiveDoor] = useState<Door | null>(null);
  const [returnFocusDoor, setReturnFocusDoor] = useState<Door | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doorElRefs = useRef<Record<Door, HTMLButtonElement | null>>({
    backend: null,
    frontend: null,
    ia: null,
  });

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeDoor) {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [activeDoor]);

  useEffect(() => {
    if (!activeDoor && !openingDoor && returnFocusDoor) {
      doorElRefs.current[returnFocusDoor]?.focus();
      setReturnFocusDoor(null);
    }
  }, [activeDoor, openingDoor, returnFocusDoor]);

  useEffect(() => {
    if (!activeDoor && !openingDoor) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (typeof document !== "undefined" && document.querySelector("dialog[open]")) {
        return;
      }
      const targetDoor = activeDoor ?? openingDoor;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setOpeningDoor(null);
      setActiveDoor(null);
      if (targetDoor) {
        setReturnFocusDoor(targetDoor);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeDoor, openingDoor]);

  const handleSelectDoor = (door: Door) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const delay = isReducedMotion() ? 150 : OPEN_DELAY_MS;
    setOpeningDoor(door);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setOpeningDoor(null);
      setActiveDoor(door);
    }, delay);
  };

  const handleBack = () => {
    const prev = activeDoor;
    setActiveDoor(null);
    setOpeningDoor(null);
    if (prev) setReturnFocusDoor(prev);
  };

  const doorRefs: Record<Door, (el: HTMLButtonElement | null) => void> = {
    backend: (el) => {
      doorElRefs.current.backend = el;
    },
    frontend: (el) => {
      doorElRefs.current.frontend = el;
    },
    ia: (el) => {
      doorElRefs.current.ia = el;
    },
  };

  return (
    <Section id="projetos" title={c.title}>
      <Featured lang={lang} />

      {!mounted ? (
        <div className="s-doors-static">
          {DOOR_ORDER.map((door) => (
            <DoorPanel
              key={door}
              door={door}
              lang={lang}
              staticMode
            />
          ))}
        </div>
      ) : activeDoor ? (
        <DoorPanel
          door={activeDoor}
          lang={lang}
          headingRef={headingRef}
          onBack={handleBack}
        />
      ) : (
        <Doors
          openingDoor={openingDoor}
          onSelectDoor={handleSelectDoor}
          doorRefs={doorRefs}
        />
      )}
    </Section>
  );
}
