import SitePage from "@/components/site/SitePage";
import { getContributions } from "@/lib/github";

export const revalidate = 86400;

export default async function Page() {
  const contributions = await getContributions();
  return <SitePage contributions={contributions} />;
}
