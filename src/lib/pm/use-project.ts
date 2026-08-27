import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  STORAGE_KEY,
  STORAGE_KEY_V1,
  emptyProject,
  emptyWorkspace,
  isoNow,
  parseProject,
  sampleProject,
  type Project,
} from "@/lib/pm/model";
import { exportIsStale, parseWorkspaceKeepExport, type WorkspaceWithExport } from "@/lib/pm/export-freshness";
import { isBlankProject, isStockSample, pruneWorkspace } from "@/lib/pm/workspace-ops";

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  localStorage.removeItem(STORAGE_KEY_V1);
}

export function useProject() {
  const [workspace, setWorkspace] = useState<WorkspaceWithExport>(emptyWorkspace);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    setWorkspace(readWorkspace());
    setReady(true);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!ready || !hydrated.current) return;
    persist(workspace);
  }, [workspace, ready]);

  const project = workspace.projects[workspace.activeId] ?? emptyProject();

  const setProject = useCallback((next: Project | ((prev: Project) => Project)) => {
    setWorkspace((ws) => {
      const current = ws.projects[ws.activeId] ?? emptyProject();
      const value = typeof next === "function" ? next(current) : next;
      return {
        ...ws,
        projects: {
          ...ws.projects,
          [value.id]: { ...value, updatedAt: isoNow() },
        },
        activeId: value.id,
      };
    });
  }, []);

  const patch = useCallback((partial: Partial<Project>) => {
    setProject((p) => ({ ...p, ...partial }));
  }, [setProject]);

  const createProject = useCallback((seed?: Project) => {
    setWorkspace((ws) => {
      const clean = pruneWorkspace(ws);
      if (!seed) {
        const existingBlank = Object.values(clean.projects).find(isBlankProject);
        if (existingBlank) return { ...clean, activeId: existingBlank.id };
      }
      const next = seed ? parseProject({ ...seed, id: uidSafe() }) : emptyProject();
      return {
        version: 2,
        activeId: next.id,
        lastExportAt: clean.lastExportAt,
        projects: { ...clean.projects, [next.id]: { ...next, updatedAt: isoNow() } },
      };
    });
    return "";
  }, []);

  const switchProject = useCallback((id: string) => {
    setWorkspace((ws) => (ws.projects[id] ? { ...ws, activeId: id } : ws));
  }, []);

  const reset = useCallback(() => {
    setWorkspace((ws) => {
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
      const clean = pruneWorkspace(ws);
      const existing = Object.values(clean.projects).find(isStockSample);
      if (existing) return { ...clean, activeId: existing.id };
      const active = clean.projects[clean.activeId];
      const sample = sampleProject();
      if (active && isBlankProject(active)) {
        const reused = { ...sample, id: active.id, updatedAt: isoNow() };
        return {
          ...clean,
          projects: { ...clean.projects, [active.id]: reused },
        };
      }
      return {
        version: 2,
        activeId: sample.id,
        lastExportAt: clean.lastExportAt,
        projects: { ...clean.projects, [sample.id]: { ...sample, updatedAt: isoNow() } },
      };
    });
  }, []);

  const exportJson = useCallback(() => {
    const stamped: WorkspaceWithExport = { ...workspace, lastExportAt: isoNow() };
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
    setWorkspace((ws) => {
      const projects = { ...ws.projects, ...parsed.projects };
      return pruneWorkspace({
        version: 2,
        activeId: parsed.activeId,
        lastExportAt: isoNow(),
        projects,
      });
    });
  }, []);

  const list = useMemo(
    () => Object.values(workspace.projects).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [workspace.projects],
  );

  return {
    project,
    list,
    activeId: workspace.activeId,
    patch,
    setProject,
    reset,
    createProject,
    switchProject,
    loadSample,
    exportJson,
    importJson,
    ready,
    backupStale: exportIsStale(workspace.lastExportAt, project.updatedAt),
    lastExportAt: workspace.lastExportAt,
  };
}

function uidSafe() {
  return Math.random().toString(36).slice(2, 10);
}
