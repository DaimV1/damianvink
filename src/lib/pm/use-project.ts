import { useCallback, useEffect, useState } from "react";
import {
  emptyProject,
  parseProject,
  STORAGE_KEY,
  type Project,
} from "@/lib/pm/model";

export function useProject() {
  const [project, setProject] = useState<Project>(emptyProject);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProject(parseProject(JSON.parse(raw)));
    } catch {
      /* keep empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }, [project, ready]);

  const patch = useCallback((partial: Partial<Project>) => {
    setProject((p) => ({ ...p, ...partial }));
  }, []);

  const reset = useCallback(() => {
    const next = emptyProject();
    setProject(next);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { project, setProject, patch, reset, ready };
}
