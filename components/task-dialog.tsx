"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RANGE_END, RANGE_START } from "@/lib/dates";
import { PRIORITY_OPTIONS, REPEAT_OPTIONS } from "@/lib/recurrence";
import type { Task, TaskInput } from "@/lib/types";

interface TaskDialogProps {
  task: Task | null;
  defaultDate: string;
  onClose: () => void;
  onSubmit: (input: TaskInput) => Promise<void>;
}

const fieldClass =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20";

export function TaskDialog({
  task,
  defaultDate,
  onClose,
  onSubmit,
}: TaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(task?.title ?? "");
  const [note, setNote] = useState(task?.note ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? defaultDate);
  const [dueTime, setDueTime] = useState(task?.dueTime ?? "");
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [repeat, setRepeat] = useState(task?.repeat ?? "none");
  const [repeatUntil, setRepeatUntil] = useState(task?.repeatUntil ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title,
        note,
        dueDate,
        dueTime: dueTime || null,
        priority,
        repeat,
        repeatUntil: repeat !== "none" && repeatUntil ? repeatUntil : null,
      });
    } catch {
      setError("Úkol se nepodařilo uložit. Zkontroluj údaje a zkus to znovu.");
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-labelledby="task-dialog-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-line bg-card p-0 text-ink shadow-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="task-dialog-title"
            className="font-serif text-2xl font-semibold tracking-tight"
          >
            {task ? "Upravit úkol" : "Nový úkol"}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Zavřít"
            className="flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-primary-soft hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Název
          <input
            required
            autoFocus
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Např. Zavolat zubaři"
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Poznámka
          <textarea
            rows={3}
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Volitelné podrobnosti"
            className={`${fieldClass} resize-none`}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Datum
            <input
              required
              type="date"
              min={RANGE_START}
              max={RANGE_END}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Čas
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Priorita
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={fieldClass}
            >
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Opakování
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className={fieldClass}
            >
              {REPEAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {repeat !== "none" && (
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Opakovat do (nepovinné)
            <input
              type="date"
              min={dueDate}
              max={RANGE_END}
              value={repeatUntil}
              onChange={(e) => setRepeatUntil(e.target.value)}
              className={fieldClass}
            />
            <span className="text-xs font-normal text-muted">
              Když nic nevyplníš, úkol se opakuje do konce roku 2027.
            </span>
          </label>
        )}

        {error && (
          <p role="alert" className="text-sm text-high">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium transition hover:bg-paper"
          >
            Zrušit
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Ukládám…" : task ? "Uložit změny" : "Přidat úkol"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
