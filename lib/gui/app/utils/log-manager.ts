/**
 * Application logging with rotation and levels.
 * Writes to both console and file with configurable verbosity.
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
}

const LEVEL_NAMES = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_LOG_FILES = 3;

let currentLevel = LogLevel.INFO;
let logFilePath: string | null = null;

function getLogDir(): string {
	try {
		return path.join(app.getPath('userData'), 'logs');
	} catch {
		return path.join(process.env.HOME || '/tmp', '.spark', 'logs');
	}
}

/**
 * Initialize the log manager.
 */
export function initLogger(level: LogLevel = LogLevel.INFO): void {
	currentLevel = level;
	const logDir = getLogDir();
	if (!fs.existsSync(logDir)) {
		fs.mkdirSync(logDir, { recursive: true });
	}
	logFilePath = path.join(logDir, 'spark.log');
	rotateIfNeeded();
}

/**
 * Rotate log files if current exceeds max size.
 */
function rotateIfNeeded(): void {
	if (!logFilePath || !fs.existsSync(logFilePath)) return;
	const stat = fs.statSync(logFilePath);
	if (stat.size < MAX_LOG_SIZE) return;

	// Rotate: spark.log.2 -> spark.log.3, spark.log.1 -> spark.log.2, spark.log -> spark.log.1
	for (let i = MAX_LOG_FILES - 1; i >= 1; i--) {
		const from = `${logFilePath}.${i}`;
		const to = `${logFilePath}.${i + 1}`;
		if (fs.existsSync(from)) {
			if (i + 1 > MAX_LOG_FILES) {
				fs.unlinkSync(from);
			} else {
				fs.renameSync(from, to);
			}
		}
	}
	fs.renameSync(logFilePath, `${logFilePath}.1`);
}

function formatMessage(level: LogLevel, message: string, context?: string): string {
	const timestamp = new Date().toISOString();
	const levelName = LEVEL_NAMES[level];
	const ctx = context ? ` [${context}]` : '';
	return `${timestamp} ${levelName}${ctx}: ${message}`;
}

function write(level: LogLevel, message: string, context?: string): void {
	if (level < currentLevel) return;
	const formatted = formatMessage(level, message, context);

	// Console output
	switch (level) {
		case LogLevel.ERROR: console.error(formatted); break;
		case LogLevel.WARN: console.warn(formatted); break;
		default: console.log(formatted);
	}

	// File output
	if (logFilePath) {
		try {
			fs.appendFileSync(logFilePath, formatted + '\n');
		} catch {
			// Silently fail
		}
	}
}

export function debug(message: string, context?: string): void { write(LogLevel.DEBUG, message, context); }
export function info(message: string, context?: string): void { write(LogLevel.INFO, message, context); }
export function warn(message: string, context?: string): void { write(LogLevel.WARN, message, context); }
export function error(message: string, context?: string): void { write(LogLevel.ERROR, message, context); }

/**
 * Set log level at runtime.
 */
export function setLevel(level: LogLevel): void {
	currentLevel = level;
}

/**
 * Get path to current log file.
 */
export function getLogFilePath(): string | null {
	return logFilePath;
}
