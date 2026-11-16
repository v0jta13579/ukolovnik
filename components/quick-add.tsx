"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { RANGE_END, RANGE_START } from "@/lib/dates";
import { REPEAT_OPTIONS } from "@/lib/recurrence";
import type { TaskInput } from "@/lib/types";

interface QuickAddProps {
  defaultDate: string;
  onAdd: (input: TaskInput) => Promise<void>;
  onOpenDetail: () => void;
}

const fieldClass =
  "rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20";

export function QuickAdd({ defaultDate, onAdd, onOpenDetail }: QuickAddProps) {
  const [title, setTitle] = useState("");
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [repeat, setRepeat] = useState("none");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const date = pickedDate ?? defaultDate;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving || !title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onAdd({
        title,
        note: "",
        dueDate: date,
        dueTime: null,
        priority: "medium",
        repeat,
        repeatUntil: null,
      });
      setTitle("");
      setRepeat("none");
    } catch {
      setError("Úkol se nepodařilo přidat, zkus to znovu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-xl border border-dashed border-primary/40 bg-primary-soft/40 p-3"
      aria-label="Rychlé přidání úkolu"
    >
      <div className="flex flex-col gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Co je potřeba udělat?"
          aria-label="Název nového úkolu"
          className={`${fieldClass} w-full`}
        />
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            min={RANGE_START}
            max={RANGE_END}
            value={date}
            onChange={(e) => setPickedDate(e.target.value)}
            aria-label="Datum nového úkolu"
            className={fieldClass}
          />
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            aria-label="Opakování nového úkolu"
            className={fieldClass}
          >
            {REPEAT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="size-4" aria-hidden />
            Přidat
          </button>
          <button
            type="button"
            onClick={onOpenDetail}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2 text-sm font-medium transition hover:bg-paper"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Podrobně
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-high">
          {error}
        </p>
      )}
    </form>
  );
}
