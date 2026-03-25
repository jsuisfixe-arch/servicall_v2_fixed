/**
 * STRUCTURED TYPES — PONT D'IMPORT
 * Re-export depuis workflow-engine/structured-types
 * pour résoudre les imports "../../structured-types"
 * depuis server/workflow-engine/actions/*.ts
 */
export type {
  ProspectData,
  CallData,
  AIData,
  WorkflowVariables,
  EventMetadata,
  StructuredIncomingEvent,
  FinalExecutionContext,
} from "./workflow-engine/structured-types";
