/** Formata centavos (inteiro) para string de exibição: 120 → "1,20" */
export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** Extrai centavos (inteiro) de uma string formatada: "1,20" → 120 */
export function parseCents(display: string): number {
  const digits = display.replace(/\D/g, "");
  return parseInt(digits, 10) || 0;
}

/** Converte string de exibição "1,20" para string da API "1.20" */
export function displayToAPI(display: string): string {
  const cents = parseCents(display);
  return (cents / 100).toFixed(2);
}
