export const logger = {
  info(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV === "development") {
      console.info(message, ...args);
    }
  },
  warn(message: string, ...args: unknown[]): void {
    console.warn(message, ...args);
  },
  error(message: string, ...args: unknown[]): void {
    console.error(message, ...args);
  },
};
