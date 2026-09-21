import type { Metadata } from "next";
import NotFoundContent from "@/components/NotFoundContent";

export const metadata: Metadata = {
  title: "Página não encontrada — Gabriel Coelho",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundContent />;
}
