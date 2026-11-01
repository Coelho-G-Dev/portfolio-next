import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import RedesignPage from "@/components/redesign/RedesignPage";
import { getContributions } from "@/lib/github";
import "./redesign.css";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  display: "swap",
  variable: "--font-schibsted",
});

export const metadata: Metadata = {
  title: "Gabriel Coelho | Prévia do redesign",
  robots: { index: false, follow: false },
};

export const revalidate = 86400;

export default async function Page() {
  const contributions = await getContributions();
  return (
    <div className={schibsted.variable}>
      <RedesignPage contributions={contributions} />
    </div>
  );
}
