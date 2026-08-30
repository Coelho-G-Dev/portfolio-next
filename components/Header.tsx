"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { href: "/#trabalho", label: "TRABALHO" },
  { href: "/#metodo", label: "MÉTODO" },
  { href: "/#sobre", label: "SOBRE" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const trackedIds = ["hero", ...links.map((l) => l.href.slice(1)), "contato"];
    const sections = trackedIds.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          const isNavLink = links.some((l) => l.href === `#${id}`);
          setActive(isNavLink ? `#${id}` : "");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10 py-5 text-cream bg-navy/95 backdrop-blur-md border-b border-cream/10">
        <a href="#hero" className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full border border-cream/60 flex items-center justify-center font-mono text-xs">
            GC
          </span>
          <span className="font-mono text-xs tracking-widest uppercase">Gabriel Coelho</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase">
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

        <div className="flex items-center gap-4">
          <a
            href="#contato"
            className="hidden sm:flex items-center gap-1.5 border border-lime text-lime rounded-full px-4 py-2 font-mono text-xs tracking-widest uppercase hover:bg-lime hover:text-navy transition-colors"
          >
            Vamos conversar <ArrowUpRight size={14} />
          </a>

          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* menu mobile: flyout full-screen, fecha com X ou clicando num link */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[60] bg-navy text-cream flex flex-col items-center justify-center gap-10 transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
          className="absolute top-6 right-6"
        >
          <X size={24} />
        </button>

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
            Vamos conversar <ArrowUpRight size={14} />
          </a>
        </nav>
      </div>
    </>
  );
}
