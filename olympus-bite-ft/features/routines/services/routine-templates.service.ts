import { PRESET_ROUTINES, type RoutinePreset } from "../data/preset-routines";

const STORAGE_KEY = "ob_trainer_routine_templates";

class RoutineTemplatesService {
  private getStored(): RoutinePreset[] {
    if (typeof window === "undefined") return PRESET_ROUTINES;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Initialize with default presets
        localStorage.setItem(STORAGE_KEY, JSON.stringify(PRESET_ROUTINES));
        return PRESET_ROUTINES;
      }
      const parsed: RoutinePreset[] = JSON.parse(data);
      const missing = PRESET_ROUTINES.filter(
        (preset) => !parsed.some((p) => p.id === preset.id),
      );
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return PRESET_ROUTINES;
    }
  }

  private save(templates: RoutinePreset[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch {
      // ignore
    }
  }

  getAll(): RoutinePreset[] {
    return this.getStored();
  }

  getById(id: string): RoutinePreset | undefined {
    return this.getStored().find((t) => t.id === id);
  }

  create(preset: Omit<RoutinePreset, "id">): RoutinePreset {
    const templates = this.getStored();
    const newPreset: RoutinePreset = {
      ...preset,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [newPreset, ...templates];
    this.save(updated);
    return newPreset;
  }

  update(id: string, updates: Partial<RoutinePreset>): RoutinePreset | null {
    const templates = this.getStored();
    const idx = templates.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const updatedTemplate = { ...templates[idx], ...updates };
    templates[idx] = updatedTemplate;
    this.save(templates);
    return updatedTemplate;
  }

  delete(id: string): boolean {
    const templates = this.getStored();
    const filtered = templates.filter((t) => t.id !== id);
    if (filtered.length === templates.length) return false;
    this.save(filtered);
    return true;
  }

  duplicate(id: string): RoutinePreset | null {
    const template = this.getById(id);
    if (!template) return null;

    const copy: RoutinePreset = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copia)`,
      tags: [...template.tags, "Copia"],
    };
    const templates = this.getStored();
    const updated = [copy, ...templates];
    this.save(updated);
    return copy;
  }

  resetDefaults(): void {
    this.save(PRESET_ROUTINES);
  }
}

export const routineTemplatesService = new RoutineTemplatesService();
