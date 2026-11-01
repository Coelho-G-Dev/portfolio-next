import type { ReactNode } from "react";

export type Surface = "light" | "dark";

export function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// Pílula de ação (spec §5.1). A primária leva um círculo com seta à direita;
// a secundária é vazada e se preenche no hover.
export default function Pill({
  href,
  children,
  variant,
  surface,
}: {
  href: string;
  children: ReactNode;
  variant: "primary" | "secondary";
  surface: Surface;
}) {
  return (
    <a className="s-pill" data-variant={variant} data-surface={surface} href={href}>
      <span className="s-pill__label">{children}</span>
      {variant === "primary" && (
        <span className="s-pill__dot">
          <Arrow />
        </span>
      )}
    </a>
  );
}
