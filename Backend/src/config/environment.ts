const PRODUCTION_REQUIRED_VARIABLES = [
  "JWT_SECRET",
  "MONGO_URI",
  "ALLOWED_ORIGINS",
  "CLIENT_URL",
  "CRON_SECRET",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "VNP_TMN_CODE",
  "VNP_HASH_SECRET",
  "VNP_URL",
  "VNP_RETURN_URL",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
] as const;

type Environment = Record<string, string | undefined>;

export function getAllowedOrigins(value = process.env.ALLOWED_ORIGINS): string[] {
  return (value || "http://localhost:5173,http://localhost:4173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getProductionEnvironmentIssues(env: Environment = process.env): string[] {
  if (env.NODE_ENV !== "production") return [];

  return PRODUCTION_REQUIRED_VARIABLES.filter((name) => !env[name]?.trim());
}

export function assertProductionEnvironment(env: Environment = process.env): void {
  const missing = getProductionEnvironmentIssues(env);
  if (missing.length > 0) {
    throw new Error(`Production configuration is incomplete. Missing: ${missing.join(", ")}`);
  }
}
