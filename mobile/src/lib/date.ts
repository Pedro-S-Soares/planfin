/** Converte Date para string ISO "YYYY-MM-DD" */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Converte string ISO "YYYY-MM-DD" para formato brasileiro "DD/MM/AAAA" */
export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Converte string ISO "YYYY-MM-DD" para Date (meia-noite local) */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** "qua, 05/11": how a day reads on a bank statement. */
export function formatWeekdayDate(iso: string): string {
  return `${WEEKDAYS[parseISODate(iso).getDay()]}, ${formatDateBR(iso).slice(0, 5)}`;
}

const SHORT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/**
 * Months a period covers, without repeating what is shared:
 * "Nov 2026" · "Nov – Dez 2026" · "Dez 2026 – Jan 2027". Null without both dates.
 */
export function formatPeriodMonths(startISO?: string | null, endISO?: string | null): string | null {
  if (!startISO || !endISO) return null;
  const [startYear, startMonth] = startISO.split("-").map(Number);
  const [endYear, endMonth] = endISO.split("-").map(Number);
  const start = SHORT_MONTHS[startMonth - 1];
  const end = SHORT_MONTHS[endMonth - 1];
  if (startYear !== endYear) return `${start} ${startYear} – ${end} ${endYear}`;
  if (startMonth !== endMonth) return `${start} – ${end} ${endYear}`;
  return `${start} ${endYear}`;
}
