import type { workflows, workflowExecutions } from "../../drizzle/schema";

export interface ActionConfig {
  [key: string]: any;
}

export interface WorkflowStep {
  id: string;
  type: string;
  label: string;
  config: ActionConfig;
  order: number;
}

export type Workflow = {
  id: number;
  tenantId: number;
  name: string;
  description: string | null;
  /** Champ principal DB */
  triggerType: string | null;
  /** Alias legacy de triggerType — maintenu pour compatibilité client */
  trigger?: string | null;
  /** Config du déclencheur */
  triggerConfig?: Record<string, unknown> | null;
  actions: WorkflowStep[] | null;
  isActive: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type WorkflowExecution = {
  id: number;
  workflowId: number;
  tenantId: number;
  status: string;
  trigger: string;
  input: any | null;
  output: any | null;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
