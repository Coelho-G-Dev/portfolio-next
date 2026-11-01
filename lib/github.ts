// Lê o calendário público de contribuições do GitHub (o mesmo HTML que o perfil usa).
// Não precisa de token. Contribuições privadas só entram se o perfil tiver
// "Include private contributions" ligado nas configurações do GitHub.

export const GITHUB_USER = "Coelho-G-Dev";

export type ContributionWeek = {
  start: string; // data ISO do primeiro dia da semana
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // maior nível de um dia na semana
};

export type Contributions = { total: number; weeks: ContributionWeek[] };

const DAY_RE = /data-date="(\d{4}-\d{2}-\d{2})"\s+id="([^"]+)"[^>]*data-level="(\d)"/g;
const TIP_RE = /<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g;

export function parseContributions(html: string): Contributions {
  const counts = new Map<string, number>();
  for (const [, id, text] of html.matchAll(TIP_RE)) {
    const n = text.trim().match(/^(\d+)/);
    counts.set(id, n ? Number(n[1]) : 0);
  }

  const days = [...html.matchAll(DAY_RE)]
    .map(([, date, id, level]) => ({ date, count: counts.get(id) ?? 0, level: Number(level) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const weeks: ContributionWeek[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const slice = days.slice(i, i + 7);
    weeks.push({
      start: slice[0].date,
      count: slice.reduce((sum, d) => sum + d.count, 0),
      level: Math.max(...slice.map((d) => d.level)) as ContributionWeek["level"],
    });
  }

  const total = Number(html.match(/([\d,.]+)\s+contributions?\s+in the last year/)?.[1].replace(/[,.]/g, "") ?? 0);
  return { total: total || weeks.reduce((sum, w) => sum + w.count, 0), weeks };
}

export async function getContributions(): Promise<Contributions | null> {
  try {
    const res = await fetch(`https://github.com/users/${GITHUB_USER}/contributions`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;
    const data = parseContributions(await res.text());
    return data.weeks.length ? data : null;
  } catch {
    return null;
  }
}
