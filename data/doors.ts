import { projects, type Facet, type Project } from "./projects";

// Fonte única das portas. O tipo `Door` deriva desta lista.
export const DOORS = ["backend", "frontend", "ia"] as const;
export type Door = (typeof DOORS)[number];

export const isDoor = (id: unknown): id is Door => typeof id === "string" && (DOORS as readonly string[]).includes(id);

export type DoorEntry = { project: Project; facet: Facet; home: Door };

// Projetos de uma porta: primeiro quem mora nela (`doors[0]`), depois quem só
// aparece nela. Em cada grupo vale a ordem de `projects`. Projeto sem ficha
// naquela porta fica de fora.
export function projectsForDoor(door: Door, list: Project[] = projects): DoorEntry[] {
  const entries: DoorEntry[] = [];
  for (const project of list) {
    const facet = project.facets?.[door];
    const home = project.doors?.[0];
    if (!facet || !home || !project.doors?.includes(door)) continue;
    entries.push({ project, facet, home });
  }
  return [...entries.filter((e) => e.home === door), ...entries.filter((e) => e.home !== door)];
}
