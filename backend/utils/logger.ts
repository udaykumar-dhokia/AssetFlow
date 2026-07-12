// ============================================================
// Logger Utility
// Reads config from .env:
//   DB_LOGS=true        → logs DB queries
//   PROJECT_LOGS=true   → logs project activity to terminal
//   FILE_LOG=true       → writes all logs to /logs folder
// ============================================================

import * as fs from 'fs';
import * as path from 'path';

// ──────────────────────────────────────────────────────────────
// Config (read from process.env, set by dotenv in main.ts)
// ──────────────────────────────────────────────────────────────
const DB_LOGS_ENABLED = process.env.DB_LOGS === 'true';
const PROJECT_LOGS_ENABLED = process.env.PROJECT_LOGS === 'true';
const FILE_LOG_ENABLED = process.env.FILE_LOG === 'true';

// ──────────────────────────────────────────────────────────────
// Log Levels
// ──────────────────────────────────────────────────────────────
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'DB';

// ──────────────────────────────────────────────────────────────
// Log Directory & File Setup
// ──────────────────────────────────────────────────────────────
const LOG_DIR = path.resolve(process.cwd(), 'logs');

function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function getLogFilePath(level: LogLevel): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const fileName =
    level === 'DB' ? `db-${date}.log` : `app-${date}.log`;
  return path.join(LOG_DIR, fileName);
}

function writeToFile(level: LogLevel, line: string): void {
  if (!FILE_LOG_ENABLED) return;
  ensureLogDir();
  const filePath = getLogFilePath(level);
  fs.appendFileSync(filePath, line + '\n', 'utf8');
}

// ──────────────────────────────────────────────────────────────
// Terminal Colors
// ──────────────────────────────────────────────────────────────
const COLORS: Record<LogLevel, string> = {
  INFO:  '\x1b[36m',  // Cyan
  WARN:  '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m',  // Red
  DEBUG: '\x1b[35m',  // Magenta
  DB:    '\x1b[34m',  // Blue
};
const RESET = '\x1b[0m';

// ──────────────────────────────────────────────────────────────
// Core Log Function
// ──────────────────────────────────────────────────────────────
function formatLog(
  level: LogLevel,
  context: string,
  message: string,
  meta?: unknown,
): string {
  const timestamp = new Date().toISOString();
  const metaPart = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] [${context}] ${message}${metaPart}`;
}

function log(
  level: LogLevel,
  context: string,
  message: string,
  meta?: unknown,
): void {
  const line = formatLog(level, context, message, meta);

  // DB logs → only if DB_LOGS is enabled
  if (level === 'DB') {
    if (!DB_LOGS_ENABLED) return;
    const colored = `${COLORS.DB}${line}${RESET}`;
    console.log(colored);
    writeToFile('DB', line);
    return;
  }

  // Project logs → terminal if PROJECT_LOGS is enabled
  if (PROJECT_LOGS_ENABLED) {
    const colored = `${COLORS[level]}${line}${RESET}`;
    if (level === 'ERROR') {
      console.error(colored);
    } else if (level === 'WARN') {
      console.warn(colored);
    } else {
      console.log(colored);
    }
  }

  // File log → write to file if FILE_LOG is enabled
  writeToFile(level, line);
}

// ──────────────────────────────────────────────────────────────
// Logger Factory — create a scoped logger per module/service
// ──────────────────────────────────────────────────────────────
export function createLogger(context: string) {
  return {
    /** General info log */
    info: (message: string, meta?: unknown) =>
      log('INFO', context, message, meta),

    /** Warning log */
    warn: (message: string, meta?: unknown) =>
      log('WARN', context, message, meta),

    /** Error log */
    error: (message: string, meta?: unknown) =>
      log('ERROR', context, message, meta),

    /** Debug log */
    debug: (message: string, meta?: unknown) =>
      log('DEBUG', context, message, meta),

    /** Database query log — only fires if DB_LOGS=true */
    db: (message: string, meta?: unknown) =>
      log('DB', context, message, meta),
  };
}

// ──────────────────────────────────────────────────────────────
// Default App-Level Logger
// ──────────────────────────────────────────────────────────────
export const logger = createLogger('App');
