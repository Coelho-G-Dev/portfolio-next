import type { DirectStage } from "./directFlow";
import type { Stage } from "./messageFlow";

export type Mode = "queue" | "direct";
export type AppStatus = "idle" | "connecting" | "processing" | "delivered" | "error";

// O que a tela de cadastro do AuthGuard mostra para a mensagem mais recente.
// Com fila, uma queda nunca vira erro: a conta existe e o e-mail espera.
// Sem fila, a mesma queda vira erro para quem está usando o app.
export function appStatus(mode: Mode, stage: Stage | DirectStage | undefined): AppStatus {
  if (stage === undefined) return "idle";
  if (stage === "delivered") return "delivered";
  if (mode === "queue") return stage === "interface" ? "connecting" : "processing";
  return stage === "lost" ? "error" : "processing";
}
