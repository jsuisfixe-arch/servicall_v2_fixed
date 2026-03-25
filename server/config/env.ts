/**
 * STRICT ENVIRONMENT VALIDATION - Hard CTO Mode
 * PHASE 6 - Validation with Zod
 */
import { z } from 'zod';
import { logger } from "../infrastructure/logger";


const envSchema = z.object({
  // --- CORE CONFIG ---
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // --- DATABASE ---
  DATABASE_URL: z.string().url(),
  
  // --- SECURITY ---
  ENCRYPTION_KEY: z.string().min(32, "Encryption key must be at least 32 characters"),
  JWT_SECRET: z.string().min(16, "JWT secret must be at least 16 characters"),
  
  // --- SERVICES (CRITICAL) ---
  OPENAI_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  
  // --- OPTIONAL ---
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  REDIS_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (): Env => {
  try {
    const parsed = envSchema.parse(process.env);
    logger.info("✅ Environment validation successful");
    return parsed;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const missingVars = (error as z.ZodError).errors.map(e => e.path.join(".")).join(", ");
      logger.fatal(`❌ FATAL: Environment validation failed. Missing or invalid variables: ${missingVars}`);
      // En mode CTO Hard, on empêche le démarrage si les variables critiques manquent
      if (process.env["NODE_ENV"] === "production") {
        logger.error(`\nFATAL: Missing or invalid environment variables: ${missingVars}\n`);
        process.exit(1);
      }
    }
    throw error;
  }
};

// Singleton instance
export const env = validateEnv();

export default env;
