export const EMAIL = "gabrielbiellosousa@gmail.com";
export const LINKEDIN_URL = "https://www.linkedin.com/in/gabriel-coelho-7184a32a3/";
export const GITHUB_URL = "https://github.com/Coelho-G-Dev";

export type ContactKind = "role" | "project";

export type MailCopy = {
  subject: Record<ContactKind, string>;
  body: Record<ContactKind, string>;
};

// encodeURIComponent (e não URLSearchParams): "+" no lugar de espaço aparece
// literalmente em vários clientes de e-mail.
export function mailtoFor(copy: MailCopy, kind: ContactKind): string {
  const subject = encodeURIComponent(copy.subject[kind]);
  const body = encodeURIComponent(copy.body[kind]);
  return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
}
