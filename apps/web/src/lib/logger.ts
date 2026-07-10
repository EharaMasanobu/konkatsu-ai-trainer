type LogMeta = Record<string, unknown> | Error | unknown;

class Logger {
  error(message: string, meta?: LogMeta): void {
    console.error(`[ERROR] ${message}`, meta ?? "");
  }

  warn(message: string, meta?: LogMeta): void {
    console.warn(`[WARN] ${message}`, meta ?? "");
  }

  info(message: string, meta?: LogMeta): void {
    console.info(`[INFO] ${message}`, meta ?? "");
  }
}

export const logger = new Logger();
