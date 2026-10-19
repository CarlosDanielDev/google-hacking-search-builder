import { EMPTY_STATE, type DorkState } from "./dork";

export interface DorkPreset {
  id: string;
  goal: string; // PT-BR
  state: DorkState;
}

/** Curated, public GHDB-style starting points. Every preset MUST pass
 *  validateState — a preset that is born invalid does not ship (pinned by test). */
export const DORK_PRESETS: DorkPreset[] = [
  {
    id: "telegram",
    goal: "Canais e grupos do Telegram sobre um tópico",
    state: { ...EMPTY_STATE, sites: ["t.me"], topics: ["osint"] },
  },
  {
    id: "docs",
    goal: "Documentos expostos (pdf, xlsx, docx) sobre um tema",
    state: { ...EMPTY_STATE, topics: ["relatório"], filetype: ["pdf", "xlsx", "docx"] },
  },
  {
    id: "index-of",
    goal: 'Diretórios abertos ("index of")',
    state: { ...EMPTY_STATE, phrase: "index of", slot: "intitle" },
  },
  {
    id: "login",
    goal: "Páginas de login e painéis administrativos",
    state: { ...EMPTY_STATE, topics: ["admin"], slot: "intitle", exclude: ["template", "exemplo"] },
  },
  {
    id: "pastebin",
    goal: "Vazamentos e notas coladas em pastebins",
    state: { ...EMPTY_STATE, sites: ["pastebin.com"], topics: ["password"] },
  },
  {
    id: "drive",
    goal: "Arquivos compartilhados no Google Drive",
    state: { ...EMPTY_STATE, sites: ["drive.google.com"], topics: ["planilha"] },
  },
  {
    id: "s3",
    goal: "Listagens de buckets S3",
    state: { ...EMPTY_STATE, sites: ["s3.amazonaws.com"], phrase: "index of" },
  },
  {
    id: "govbr",
    goal: "Documentos em domínios .gov.br",
    state: { ...EMPTY_STATE, sites: ["gov.br"], filetype: ["pdf"], topics: ["dados abertos"] },
  },
  {
    id: "env",
    goal: "Arquivos .env e configs esquecidos em forjas de código",
    state: { ...EMPTY_STATE, sites: ["github.com", "gitlab.com"], topics: [".env"], filetype: ["env"] },
  },
  {
    id: "multisocial",
    goal: "Perfis em várias redes de uma vez (site: OR)",
    state: { ...EMPTY_STATE, sites: ["t.me", "x.com", "instagram.com"], topics: ["perfil oficial"] },
  },
];
