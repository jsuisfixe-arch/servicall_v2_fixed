/**
 * Logger wrapper pour le workflow-engine
 * ✅ FIX CRITIQUE : Supporte à la fois l'usage singleton (logger.info)
 * ET l'usage constructeur (new Logger('name'))
 */
import { logger as baseLogger } from '../../infrastructure/logger';

/**
 * Classe Logger compatible avec new Logger('componentName')
 * Préfixe automatiquement les messages avec le nom du composant
 */
export class Logger {
  private readonly prefix: string;

  constructor(name: string) {
    this.prefix = `[${name}]`;
  }

  debug(msg: string, payload: object = {}): void {
    baseLogger.debug(`${this.prefix} ${msg}`, payload);
  }

  info(msg: string, payload: object = {}): void {
    baseLogger.info(`${this.prefix} ${msg}`, payload);
  }

  warn(msg: string, payload: object = {}): void {
    baseLogger.warn(`${this.prefix} ${msg}`, payload);
  }

  error(msg: string, error?: unknown, payload: object = {}): void {
    baseLogger.error(`${this.prefix} ${msg}`, error, payload);
  }

  fatal(msg: string, error?: unknown, payload: object = {}): void {
    baseLogger.fatal(`${this.prefix} ${msg}`, error, payload);
  }
}

// Export du singleton pour compatibilité descendante
export { baseLogger as logger };
