import { z } from "zod";

export const actionConfigSchema = z.record(z.any());

export const workflowStepSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  config: actionConfigSchema,
  order: z.number(),
});

export const workflowSchema = z.object({
  id: z.number(),
  tenantId: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  triggerType: z.enum(["manual", "scheduled", "event"]).default("manual"),
  triggerConfig: z.any().nullable(),
  actions: z.array(workflowStepSchema).nullable(),
  isActive: z.boolean().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const workflowExecutionSchema = z.object({
  id: z.number(),
  workflowId: z.number(),
  tenantId: z.number(),
  status: z.string(),
  trigger: z.string(),
  input: z.any().nullable(),
  output: z.any().nullable(),
  error: z.string().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const paginatedWorkflowSchema = z.object({
  data: z.array(workflowSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type WorkflowSchema = z.infer<typeof workflowSchema>;
export type WorkflowStepSchema = z.infer<typeof workflowStepSchema>;
export type WorkflowExecutionSchema = z.infer<typeof workflowExecutionSchema>;
