import { ComplianceDashboard, ComplianceViolation } from "../../../../shared/types/security";
import { complianceDashboardSchema, complianceViolationSchema } from "../../../../shared/validators/security";

/**
 * Normalise un objet ComplianceDashboard.
 * ✅ Bloc 3: Normalisation des données
 */
export function normalizeComplianceDashboard(d: any): ComplianceDashboard {
  const result = complianceDashboardSchema.safeParse(d);
  
  if (!result.success) {
    console.warn("[Normalizer] ComplianceDashboard validation failed", result.error);
    return {
      complianceRate: d?.complianceRate ?? 0,
      violationsCount: d?.violationsCount ?? 0,
      warningsCount: d?.warningsCount ?? 0,
      nextAuditDate: d?.nextAuditDate ?? new Date().toISOString(),
      violations: Array.isArray(d?.violations) ? d.violations.map(normalizeComplianceViolation) : [],
    } as ComplianceDashboard;
  }

  return result.data as ComplianceDashboard;
}

/**
 * Normalise un objet ComplianceViolation.
 */
export function normalizeComplianceViolation(v: any): ComplianceViolation {
  const result = complianceViolationSchema.safeParse(v);
  
  if (!result.success) {
    console.warn("[Normalizer] ComplianceViolation validation failed", result.error);
    return {
      id: v?.id ?? "unknown",
      type: v?.type ?? "unknown",
      severity: v?.severity ?? "low",
      description: v?.description ?? "",
      detectedAt: v?.detectedAt ?? new Date().toISOString(),
      resolvedAt: v?.resolvedAt ?? null,
      resolution: v?.resolution ?? null,
    } as ComplianceViolation;
  }

  return result.data as ComplianceViolation;
}
