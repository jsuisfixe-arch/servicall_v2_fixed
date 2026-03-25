/**
 * STATE MACHINE — PONT D'IMPORT
 * Re-export depuis workflow-engine/state-machine/StateMachine
 * pour résoudre les imports "../../state-machine/StateMachine"
 * depuis server/workflow-engine/actions/crm/*.ts
 */
export type {
  ProspectStatus,
  CallOutcome,
  StateMachineConfig,
} from "../workflow-engine/state-machine/StateMachine";

export {
  ProspectStateMachine,
  StateMachineEngine,
} from "../workflow-engine/state-machine/StateMachine";
