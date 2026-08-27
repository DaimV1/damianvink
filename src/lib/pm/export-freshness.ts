import { parseWorkspace, type Workspace } from "./model.ts";

export type WorkspaceWithExport = Workspace & { lastExportAt?: string };

export function exportIsStale(lastExportAt: string | undefined, updatedAt: string, days = 7) {
  if (!lastExportAt) return true;
  const exported = Date.parse(lastExportAt);
  const updated = Date.parse(updatedAt);
  if (Number.isNaN(exported)) return true;
  if (!Number.isNaN(updated) && updated > exported) return true;
  return Date.now() - exported > days * 86400000;
}

export function parseWorkspaceKeepExport(raw: unknown): WorkspaceWithExport {
  const ws = parseWorkspace(raw);
  const stamp =
    raw && typeof raw === "object" && "lastExportAt" in raw && typeof (raw as { lastExportAt?: unknown }).lastExportAt === "string"
      ? (raw as { lastExportAt: string }).lastExportAt
      : undefined;
  return { ...ws, lastExportAt: stamp };
}
