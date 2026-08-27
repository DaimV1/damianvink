import { useCallback, useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEY,
  STORAGE_KEY_V1,
  emptyProject,
  emptyWorkspace,
  exportIsStale,
  isoNow,
  parseProject,
  parseWorkspace,
  sampleProject,
  type Project,
  type Workspace,
} from "@/lib/pm/model";

function readWorkspace(): Workspace {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) return parseWorkspace(JSON.parse(rawV2));
    const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) return parseWorkspace(JSON.parse(rawV1));
  } catch {
    /* keep empty */
  }
  return emptyWorkspace();
}

function persist(workspace: Workspace) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  localStorage.removeItem(STORAGE_KEY_V1);
}

export function useProject() {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWorkspace(readWorkspace());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
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
    const next = seed ? parseProject({ ...seed, id: uidSafe() }) : emptyProject();
    setWorkspace((ws) => ({
      version: 2,
      activeId: next.id,
      lastExportAt: ws.lastExportAt,
      projects: { ...ws.projects, [next.id]: { ...next, updatedAt: isoNow() } },
    }));
    return next.id;
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
      return { version: 2, activeId: ids[0], lastExportAt: ws.lastExportAt, projects: leftover };
    });
  }, []);

  const loadSample = useCallback(() => {
    createProject(sampleProject());
  }, [createProject]);

  const exportJson = useCallback(() => {
    const stamped = { ...workspace, lastExportAt: isoNow() };
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
    const parsed = parseWorkspace(JSON.parse(text));
    setWorkspace((ws) => {
      const projects = { ...ws.projects, ...parsed.projects };
      return { version: 2, activeId: parsed.activeId, lastExportAt: isoNow(), projects };
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
