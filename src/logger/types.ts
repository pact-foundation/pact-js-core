export type LogLevel = 'debug' | 'error' | 'info' | 'trace' | 'warn';

export type Logger = {
  pactCrash: (message: string, context?: string) => void;
  error: (message: string, context?: string) => void;
  warn: (message: string, context?: string) => void;
  info: (message: string, context?: string) => void;
  debug: (message: string, context?: string) => void;
  trace: (message: string, context?: string) => void;
};
