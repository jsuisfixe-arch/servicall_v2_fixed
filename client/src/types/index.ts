import type { AppRouter } from "../lib/trpc";
import type { inferRouterOutputs } from "@trpc/server";

export type RouterOutputs = inferRouterOutputs<AppRouter>;
