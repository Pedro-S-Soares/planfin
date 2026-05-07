// Replace the internals with Sentry/Highlight when ready — call sites stay unchanged.
export const logger = {
  error(context: string, message: string, data?: unknown): void {
    console.error(`[${context}]`, message, ...(data !== undefined ? [data] : []));
  },
  warn(context: string, message: string, data?: unknown): void {
    console.warn(`[${context}]`, message, ...(data !== undefined ? [data] : []));
  },
  info(context: string, message: string, data?: unknown): void {
    console.log(`[${context}]`, message, ...(data !== undefined ? [data] : []));
  },
};
