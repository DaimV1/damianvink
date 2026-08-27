import { useCallback, useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEY,
  STORAGE_KEY_V1,
  emptyProject,
  emptyWorkspace,
  isoNow,
  sampleProject,
  type Project,
} from "@/lib/pm/model";
import { exportIsStale, parseWorkspaceKeepExport, type WorkspaceWithExport } from "@/lib/pm/export-freshness";
import { isStockSample, isUntitled, pruneWorkspace, startNamedProject } from "@/lib/pm/workspace-ops";

function readWorkspace(): WorkspaceWithExport {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) return pruneWorkspace(parseWorkspaceKeepExport(JSON.parse(rawV2)));
    const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) return pruneWorkspace(parseWorkspaceKeepExport(JSON.parse(rawV1)));
  } catch {
    /* keep empty */
  }
  return emptyWorkspace();
}

function persist(workspace: WorkspaceWithExport) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pruneWorkspace(workspace)));
  localStorage.removeItem(STORAGE_KEY_V1);
}

export function useProject() {
  const [workspace, setWorkspace] = useState<WorkspaceWithExport | null>(null);

  useEffect(() => {
    setWorkspace(readWorkspace());
  }, []);

  useEffect(() => {
    if (!workspace) return;
    persist(workspace);
  }, [workspace]);

  const live = workspace ?? emptyWorkspace();
  const project = live.projects[live.activeId] ?? emptyProject();

  const setProject = useCallback((next: Project | ((prev: Project) => Project)) => {
    setWorkspace((ws) => {
      if (!ws) return ws;
      const current = ws.projects[ws.activeId];
      if (!current) return pruneWorkspace(ws);
      const value = typeof next === "function" ? next(current) : next;
      return pruneWorkspace({
        ...ws,
        projects: {
          ...ws.projects,
          [current.id]: { ...value, id: current.id, updatedAt: isoNow() },
        },
        activeId: current.id,
      });
    });
  }, []);

  const patch = useCallback((partial: Partial<Project>) => {
    setProject((p) => ({ ...p, ...partial }));
  }, [setProject]);

  const createProject = useCallback((name?: string) => {
    setWorkspace((ws) => {
      const clean = pruneWorkspace(ws ?? emptyWorkspace());
      if (name?.trim()) return startNamedProject(clean, name.trim());
      const existing = Object.values(clean.projects).find(isUntitled);
      if (existing) return { ...clean, activeId: existing.id };
      const next = emptyProject();
      return pruneWorkspace({
        version: 2,
        activeId: next.id,
        lastExportAt: clean.lastExportAt,
        projects: { ...clean.projects, [next.id]: { ...next, updatedAt: isoNow() } },
      });
    });
    return "";
  }, []);

  const switchProject = useCallback((id: string) => {
    setWorkspace((ws) => (ws && ws.projects[id] ? { ...ws, activeId: id } : ws));
  }, []);

  const reset = useCallback(() => {
    setWorkspace((ws) => {
      if (!ws) return emptyWorkspace();
      const leftover = { ...ws.projects };
      delete leftover[ws.activeId];
      const ids = Object.keys(leftover);
      if (!ids.length) return emptyWorkspace();
      return pruneWorkspace({
        version: 2,
        activeId: ids[0],
        lastExportAt: ws.lastExportAt,
        projects: leftover,
      });
    });
  }, []);

  const loadSample = useCallback(() => {
    setWorkspace((ws) => {
      const clean = pruneWorkspace(ws ?? emptyWorkspace());
      const existing = Object.values(clean.projects).find(isStockSample);
      if (existing) return { ...clean, activeId: existing.id };
      const active = clean.projects[clean.activeId];
      const sample = sampleProject();
      if (active && isUntitled(active)) {
        return pruneWorkspace({
          ...clean,
          projects: { ...clean.projects, [active.id]: { ...sample, id: active.id, updatedAt: isoNow() } },
        });
      }
      return pruneWorkspace({
        version: 2,
        activeId: sample.id,
        lastExportAt: clean.lastExportAt,
        projects: { ...clean.projects, [sample.id]: { ...sample, updatedAt: isoNow() } },
      });
    });
  }, []);

  const exportJson = useCallback(() => {
    if (!workspace) return;
    const stamped: WorkspaceWithExport = pruneWorkspace({ ...workspace, lastExportAt: isoNow() });
    const blob = new Blob([JSON.stringify(stamped, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projectwerkplek-${project.name || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setWorkspace(stamped);
  }, [workspace, project.name]);

  const importJson = useCallback(async (file: File) => {
    const text = await file.text();
    const parsed = parseWorkspaceKeepExport(JSON.parse(text));
    setWorkspace((ws) =>
      pruneWorkspace({
        version: 2,
        activeId: parsed.activeId,
        lastExportAt: isoNow(),
        projects: { ...(ws?.projects ?? {}), ...parsed.projects },
      }),
    );
  }, []);

  const list = useMemo(
    () => Object.values(live.projects).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [live.projects],
  );

  return {
    project,
    list,
    activeId: live.activeId,
    patch,
    setProject,
    reset,
    createProject,
    switchProject,
    loadSample,
    exportJson,
    importJson,
    ready: workspace !== null,
    backupStale: exportIsStale(live.lastExportAt, project.updatedAt),
    lastExportAt: live.lastExportAt,
  };
}

