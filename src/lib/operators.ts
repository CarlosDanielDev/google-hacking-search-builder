export type OperatorStatus = "live" | "blocked";

export interface OperatorFamily {
  id: string;
  label: string;
  hint: string;
  status: OperatorStatus;
  /** why a blocked operator cannot be used (Google retired it) */
  blockedWhy?: string;
}

/** The single source of truth for the palette. Blocked operators render
 *  disabled and never reach buildQuery (they cannot even enter DorkState). */
export const OPERATORS: OperatorFamily[] = [
  { id: "site", label: "site:", hint: "restringe a um site ou domínio", status: "live" },
  { id: "filetype", label: "filetype:", hint: "tipo de arquivo (pdf, xlsx, env…)", status: "live" },
  { id: "intitle", label: "intitle:", hint: "termo no título da página", status: "live" },
  { id: "intext", label: "intext:", hint: "termo no texto da página", status: "live" },
  { id: "inurl", label: "inurl:", hint: "termo na URL", status: "live" },
  { id: "inanchor", label: "inanchor:", hint: "termo no texto de âncora", status: "live" },
  { id: "phrase", label: '"frase exata"', hint: "termos na ordem exata", status: "live" },
  { id: "exclude", label: "-termo", hint: "exclui um termo dos resultados", status: "live" },
  { id: "wildcard", label: "*", hint: "curinga de uma palavra", status: "live" },
  { id: "range", label: "n..m", hint: "faixa de números", status: "live" },
  { id: "before", label: "before:", hint: "antes de uma data (YYYY-MM-DD)", status: "live" },
  { id: "after", label: "after:", hint: "depois de uma data (YYYY-MM-DD)", status: "live" },
  { id: "related", label: "related:", hint: "sites parecidos com a URL", status: "live" },
  { id: "cache", label: "cache:", hint: "versão em cache da página", status: "blocked", blockedWhy: "descontinuado pelo Google" },
  { id: "link", label: "link:", hint: "páginas que apontam para a URL", status: "blocked", blockedWhy: "descontinuado pelo Google" },
  { id: "info", label: "info:", hint: "informações sobre a página", status: "blocked", blockedWhy: "descontinuado pelo Google" },
  { id: "plus", label: "+termo", hint: "força inclusão de termo", status: "blocked", blockedWhy: "descontinuado pelo Google" },
];
