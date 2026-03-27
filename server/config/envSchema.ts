import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url("DATABASE_URL doit être une URL valide"),
  REDIS_URL: z.string().url("REDIS_URL doit être une URL valide").optional(),

  // Variables de sécurité critiques
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET doit avoir au moins 32 caractères"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET doit avoir au moins 32 caractères"),
  CSRF_SECRET: z.string().min(32, "CSRF_SECRET doit avoir au moins 32 caractères"),
  ENCRYPTION_KEY: z.string().min(32, "ENCRYPTION_KEY doit avoir au moins 32 caractères"),
  ENCRYPTION_SALT: z.string().min(32, "ENCRYPTION_SALT doit avoir au moins 32 caractères"),
  MASTER_KEY: z.string().min(32, "MASTER_KEY doit avoir au moins 32 caractères"),
  COOKIE_SECRET: z.string().min(32, "COOKIE_SECRET doit avoir au moins 32 caractères").optional(),

  // Services tiers (optionnels pour le démarrage, mais critiques pour les fonctionnalités)
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_ORG_ID: z.string().optional(),
  OPENAI_API_URL: z.string().url("OPENAI_API_URL doit être une URL valide").default("https://api.openai.com/v1"),

  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  TWILIO_WEBHOOK_URL: z.string().url("TWILIO_WEBHOOK_URL doit être une URL valide").optional(),
  TWILIO_TWIML_APP_SID: z.string().optional(),
  TWILIO_API_KEY: z.string().optional(),
  TWILIO_API_SECRET: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email("RESEND_FROM_EMAIL doit être une adresse email valide").optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url("GOOGLE_CALLBACK_URL doit être une URL valide").optional(),

  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  ALLOWED_ORIGINS: z.string().optional(),
  WEBHOOK_SECRET: z.string().optional(),

  // SMTP pour l'envoi d'emails
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // Feature flags
  DISABLE_REDIS: z.string().optional().transform(val => val === 'true'),
  DISABLE_DB: z.string().optional().transform(val => val === 'true'),
  MODE_TEST: z.string().optional().transform(val => val === 'true'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv() {
  try {
    envSchema.parse(process.env);
    console.log("✅ Variables d'environnement validées.");
  } catch (error: any) {
    console.error("❌ Erreur de validation des variables d'environnement:", error.errors);
    process.exit(1);
  }
}
