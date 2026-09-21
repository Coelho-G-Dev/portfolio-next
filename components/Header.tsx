"use client";
import { useEffect, useState, useRef } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: "/#trabalho", label: t.nav.work },
    { href: "/#metodo", label: t.nav.method },
    { href: "/#sobre", label: t.nav.about },
    { href: "/#contato", label: t.nav.contact },
  ];

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const trackedIds = ["hero", "trabalho", "metodo", "sobre", "contato"];
    const sections = trackedIds.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          const isNavLink = links.some((l) => l.href.includes(id));
          setActive(isNavLink ? `/#${id}` : "");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, [links]);

  const getFocusableElements = (container: HTMLElement | null): HTMLElement[] => {
    if (!container) return [];
    const focusableSelectors = [
      'input',
      'select',
      'textarea',
      'button',
      'a[href]',
      'area',
      'iframe',
      'object',
      'embed',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ].join(',');
    const elements = container.querySelectorAll<HTMLElement>(focusableSelectors);
    return Array.from(elements).filter(
      el => !el.hasAttribute('disabled') &&
            (el.getAttribute('aria-hidden') !== 'true') &&
            el.offsetParent !== null
    );
  };

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

      const handleTrapFocus = (event: KeyboardEvent) => {
        if (event.key === "Tab") {
          const focusableElements = getFocusableElements(menuRef.current);
          if (focusableElements.length === 0) return;

          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];

          if (event.shiftKey) { // Shift + Tab
            if (document.activeElement === first) {
              event.preventDefault();
              last.focus();
            }
          } else { // Tab
            if (document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keydown", handleTrapFocus);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keydown", handleTrapFocus);
        hamburgerRef.current?.focus();
      };
    }
  }, [open, menuRef, closeButtonRef, hamburgerRef]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10 py-5 text-cream bg-navy/95 backdrop-blur-md border-b border-cream/10">
        <a href="#hero" className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full border border-cream/60 flex items-center justify-center font-mono text-xs">
            GC
          </span>
          <span className="font-mono text-xs tracking-widest uppercase">Gabriel Coelho</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase" aria-label={t.nav.ariaMenu}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={active === l.href ? "true" : undefined}
              className={`transition-opacity hover:opacity-70 ${
                active === l.href ? "text-lime opacity-100" : "opacity-100"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Seletor de Idioma Desktop */}
          <div
            className="flex items-center bg-cream/[0.07] border border-cream/20 rounded-full p-0.5 font-mono text-xs tracking-wider"
            role="group"
            aria-label="Seleção de idioma / Language selector"
          >
            <button
              type="button"
              onClick={() => setLanguage("pt")}
              className={`px-2.5 py-1 rounded-full transition-all duration-200 text-xs ${
                language === "pt"
                  ? "bg-lime text-navy font-bold shadow-sm"
                  : "text-cream/70 hover:text-cream"
              }`}
              aria-pressed={language === "pt"}
              aria-label="Português"
            >
              PT
            </button>
            <span className="text-cream/30 text-[10px] px-0.5" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 rounded-full transition-all duration-200 text-xs ${
                language === "en"
                  ? "bg-lime text-navy font-bold shadow-sm"
                  : "text-cream/70 hover:text-cream"
              }`}
              aria-pressed={language === "en"}
              aria-label="English"
            >
              EN
            </button>
          </div>

          <a
            href="#contato"
            className="hidden sm:flex items-center gap-1.5 border border-lime text-lime rounded-full px-4 py-2 font-mono text-xs tracking-widest uppercase hover:bg-lime hover:text-navy transition-colors"
          >
            {t.nav.contactCta} <ArrowUpRight size={14} />
          </a>

          <button
            ref={hamburgerRef}
            onClick={() => setOpen(true)}
            aria-label={t.nav.openMenu}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden p-1"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <div
        ref={menuRef}
        id="mobile-menu"
        className={`fixed inset-0 z-[60] bg-navy text-cream flex flex-col items-center justify-center gap-8 transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        <button
          ref={closeButtonRef}
          onClick={() => setOpen(false)}
          aria-label={t.nav.closeMenu}
          className="absolute top-6 right-6"
        >
          <X size={24} />
        </button>

        {/* Seletor de Idioma Mobile */}
        <div
          className="flex items-center bg-cream/10 border border-cream/20 rounded-full p-1 font-mono text-sm tracking-widest"
          role="group"
          aria-label="Seleção de idioma / Language selector"
        >
          <button
            type="button"
            onClick={() => setLanguage("pt")}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
              language === "pt"
                ? "bg-lime text-navy font-bold"
                : "text-cream/70 hover:text-cream"
            }`}
            aria-pressed={language === "pt"}
            aria-label="Português"
          >
            PT
          </button>
          <span className="text-cream/30 text-xs px-1" aria-hidden="true">|</span>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
              language === "en"
                ? "bg-lime text-navy font-bold"
                : "text-cream/70 hover:text-cream"
            }`}
            aria-pressed={language === "en"}
            aria-label="English"
          >
            EN
          </button>
        </div>

        <nav className="flex flex-col items-center gap-8 font-mono text-lg tracking-widest uppercase">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a
            href="#contato"
            onClick={() => setOpen(false)}
            className="flex items-center gap-1.5 border border-lime text-lime rounded-full px-5 py-2.5 text-sm mt-4"
          >
            {t.nav.contactCta} <ArrowUpRight size={14} />
          </a>
        </nav>
      </div>
    </>
  );
}
