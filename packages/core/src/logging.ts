const SECRET_KEY = /key|secret|token|password|authorization|cookie|session/i;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogFields = {
  requestId?: string;
  userId?: string;
  operation?: string;
  provider?: string;
  model?: string;
  durationMs?: number;
  status?: string;
  errorClass?: string;
  [key: string]: unknown;
};

export type Logger = {
  child(bindings: LogFields): Logger;
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
};

function redact(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SECRET_KEY.test(k) ? '[redacted]' : redact(v);
    }
    return out;
  }
  return value;
}

export function createLogger(
  bindings: LogFields = {},
  write: (line: string) => void = (line) => console.log(line),
): Logger {
  const emit = (level: LogLevel, message: string, fields?: LogFields) => {
    write(
      JSON.stringify({
        level,
        message,
        ts: new Date().toISOString(),
        ...(redact({ ...bindings, ...fields }) as LogFields),
      }),
    );
  };

  return {
    child(extra) {
      return createLogger({ ...bindings, ...extra }, write);
    },
    debug: (message, fields) => emit('debug', message, fields),
    info: (message, fields) => emit('info', message, fields),
    warn: (message, fields) => emit('warn', message, fields),
    error: (message, fields) => emit('error', message, fields),
  };
}
