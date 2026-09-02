export type TileColor = "lime" | "blue" | "orange" | "lavender";

export type Project = {
  id: number;
  title: string;
  category: "backend" | "ia";
  type: string;
  year: string;
  description: string;
  tags: string[];
  githubLink: string;
  demoLink?: string;
  shapeColors: [TileColor, TileColor];
};

export const projects: Project[] = [
  {
    id: 1,
    title: "BuscaSUS",
    category: "backend",
    type: "API de operações",
    year: "2024",
    description:
      "Sistema back-end que integra dados públicos e Google Maps pra oferecer informações geolocalizadas sobre saúde, cultura e educação.",
    tags: ["Node.js", "Express", "MongoDB"],
    githubLink: "https://github.com/Coelho-G-Dev/Desafio-05-Back-End",
    shapeColors: ["lime", "blue"],
  },
  {
    id: 2,
    title: "Guia Maranhão",
    category: "backend",
    type: "API de serviços públicos",
    year: "2024",
    description:
      "Projeto full-stack pra centralizar o acesso a serviços públicos no Maranhão, integrando dados do IBGE e Google Maps Platform.",
    tags: ["Node.js", "Mongoose", "JWT"],
    githubLink: "https://github.com/Coelho-G-Dev/Guia-Maranhao",
    shapeColors: ["lavender", "lime"],
  },
  {
    id: 3,
    title: "API Financeira Inteligente",
    category: "ia",
    type: "API com IA",
    year: "2025",
    description:
      "API RESTful de gestão financeira com auditoria automatizada e geração de insights via IA do Google Gemini.",
    tags: ["Node.js", "PostgreSQL", "Gemini AI", "Jest"],
    githubLink: "https://github.com/Coelho-G-Dev/api-financeira-inteligente",
    shapeColors: ["blue", "lavender"],
  },
];
