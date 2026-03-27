/**
 * PLACEHOLDER ENGINE
 * Moteur centralisé et sécurisé de résolution des placeholders.
 * ✅ BLOC 6 : {var} et {{var}}, Résolution runtime, Sécurité absolue.
 * ✅ FIX [10] : Support des ternaires {{condition ? valTrue : valFalse}}
 */
import type { FinalExecutionContext } from "../structured-types";
import { Logger } from "./Logger";

type Resolvable = string | number | boolean | null | undefined | Record<string, unknown> | unknown[];

export class PlaceholderEngine {
  private static logger = new Logger("PlaceholderEngine");

  /**
   * Résout les placeholders dans un objet de configuration ou une chaîne.
   */
  static resolve(config: Resolvable, context: FinalExecutionContext): Resolvable {
    if (config === null || config === undefined) return config;
    if (typeof config === "string") {
      return this.resolveString(config, context);
    }
    if (Array.isArray(config)) {
      return config.map(item => this.resolve(item as Resolvable, context));
    }
    if (typeof config === "object") {
      const resolved: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(config as Record<string, unknown>)) {
        resolved[key] = this.resolve(value as Resolvable, context);
      }
      return resolved;
    }
    return config;
  }

  /**
   * Résout les placeholders dans une chaîne de caractères.
   * Supporte {var}, {{var}} et {{condition ? trueVal : falseVal}}.
   */
  private static resolveString(str: string, context: FinalExecutionContext): string {
    return str.replace(/\{\{?([^}]+)\}?\}/g, (_match, path: string) => {
      const trimmedPath = path.trim();

      // ✅ FIX [10] — Ternaire : détecter avant toute navigation de chemin
      if (trimmedPath.includes(' ? ')) {
        return this.evaluateTernary(trimmedPath, context);
      }

      const parts = trimmedPath.split(".");

      // ✅ PROTECTION : Allowlist de racines autorisées
      const allowedRoots: ReadonlyArray<string> = [
        "prospect", "caller", "event", "ai", "variables", "tenant", "call",
        "firstName", "lastName", "email", "phone", "last_message", "transcription",
        "ai_score", "ai_summary", "business_entities", "appointment", "visit", "property"
      ];

      const root = parts[0] ?? "";
      if (!root || !allowedRoots.includes(root)) {
        this.logger.error(`Accès à une racine non autorisée : ${root ?? 'undefined'}`);
        throw new Error(`Security Violation: Access to variable "${root ?? 'undefined'}" is forbidden in placeholders`);
      }

      // Résolution de la racine à partir du contexte structuré
      let value: any;
      switch (root) {
        case 'event':
          value = context.event;
          break;
        case 'tenant':
          value = context.tenant;
          break;
        case 'prospect':
          value = context.variables.prospect;
          break;
        case 'call':
          value = context.variables.call;
          break;
        case 'ai':
          value = context.variables.ai;
          break;
        case 'variables':
          value = context.variables;
          break;
        default:
          value = context.variables[root];
          break;
      }

      // Navigation dans le chemin restant
      const remainingParts = parts.slice(1);
      for (const part of remainingParts) {
        if (value === undefined || value === null) break;
        value = (value as Record<string, unknown>)[part];
      }

      if (value === undefined || value === null) {
        this.logger.warn(`Variable manquante ou nulle : ${trimmedPath}`);
        return "";
      }

      return String(value);
    });
  }

  /**
   * ✅ FIX [10] — Évalue une expression ternaire du type :
   *   variables.score >= 70 ? "qualifié" : "rejeté"
   *
   * Supporte les opérateurs : >=, <=, >, <, ===, ==, !==, !=
   * Les valeurs ternaires entre guillemets sont retournées nettoyées.
   */
  private static evaluateTernary(expr: string, context: FinalExecutionContext): string {
    try {
      // Découper : condition ? trueVal : falseVal
      // On cherche le premier ' ? ' pour séparer condition du reste
      const qIdx = expr.indexOf(' ? ');
      if (qIdx === -1) return "";

      const condition = expr.substring(0, qIdx).trim();
      const rest = expr.substring(qIdx + 3).trim();

      // Chercher le ' : ' séparateur des deux branches
      const colonIdx = rest.indexOf(' : ');
      if (colonIdx === -1) return "";

      const trueValRaw = rest.substring(0, colonIdx).trim();
      const falseValRaw = rest.substring(colonIdx + 3).trim();

      // Nettoyer les guillemets éventuels
      const cleanVal = (v: string) => v.replace(/^["']|["']$/g, '');
      const trueVal = cleanVal(trueValRaw);
      const falseVal = cleanVal(falseValRaw);

      // Évaluer la condition (opérateurs binaires simples uniquement)
      const conditionResult = this.evaluateCondition(condition, context);
      return conditionResult ? trueVal : falseVal;
    } catch (err) {
      this.logger.error('Ternary evaluation failed', { expr, error: err });
      return "";
    }
  }

  /**
   * Évalue une condition binaire simple.
   * Exemples : "variables.score >= 70", "variables.status == \"active\""
   */
  private static evaluateCondition(condition: string, context: FinalExecutionContext): boolean {
    const operators = ['>=', '<=', '!==', '!=', '===', '==', '>', '<'];

    for (const op of operators) {
      const idx = condition.indexOf(op);
      if (idx === -1) continue;

      const leftExpr = condition.substring(0, idx).trim();
      const rightExpr = condition.substring(idx + op.length).trim();

      // Résoudre la partie gauche (chemin de variable)
      const leftVal = this.resolveVariablePath(leftExpr, context);

      // Résoudre la partie droite (littéral ou chemin)
      const rightVal = this.resolveRightOperand(rightExpr, context);

      const left = typeof leftVal === 'number' ? leftVal : String(leftVal ?? '');
      const right = typeof rightVal === 'number' ? rightVal
        : (isNaN(Number(rightVal)) ? String(rightVal) : Number(rightVal));

      switch (op) {
        case '>=': return Number(left) >= Number(right);
        case '<=': return Number(left) <= Number(right);
        case '>':  return Number(left) > Number(right);
        case '<':  return Number(left) < Number(right);
        case '===':
        case '==': return String(left) === String(right);
        case '!==':
        case '!=': return String(left) !== String(right);
      }
    }

    // Condition sans opérateur : truthy check
    const val = this.resolveVariablePath(condition, context);
    return Boolean(val);
  }

  /**
   * Résout un chemin de variable (ex: "variables.candidate_score") depuis le contexte.
   */
  private static resolveVariablePath(path: string, context: FinalExecutionContext): unknown {
    const parts = path.split('.');
    let value: any;
    switch (parts[0]) {
      case 'variables': value = context.variables; break;
      case 'event':    value = context.event; break;
      case 'tenant':   value = context.tenant; break;
      case 'prospect': value = context.variables.prospect; break;
      case 'call':     value = context.variables.call; break;
      case 'ai':       value = context.variables.ai; break;
      default:         value = context.variables[parts[0] ?? '']; break;
    }
    for (const part of parts.slice(1)) {
      if (value === undefined || value === null) return undefined;
      value = (value as Record<string, unknown>)[part];
    }
    return value;
  }

  /**
   * Résout l'opérande droite : littéral string/number ou chemin de variable.
   */
  private static resolveRightOperand(raw: string, context: FinalExecutionContext): unknown {
    // Chaîne entre guillemets
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      return raw.slice(1, -1);
    }
    // Nombre
    if (!isNaN(Number(raw))) {
      return Number(raw);
    }
    // Boolean
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    if (raw === 'null') return null;
    // Chemin de variable
    return this.resolveVariablePath(raw, context);
  }
}
