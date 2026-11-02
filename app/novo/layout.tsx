import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gabriel Coelho | Prévia do site novo",
  robots: { index: false, follow: false },
};

export default function NovoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
