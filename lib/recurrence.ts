import { addDays, addMonths, weekdayIndex } from "./dates";
import type { Task } from "./types";

export const REPEAT_OPTIONS = [
  { value: "none", label: "Neopakovat" },
  { value: "daily", label: "Každý den" },
  { value: "weekdays", label: "Každý pracovní den" },
  { value: "weekly", label: "Každý týden" },
  { value: "biweekly", label: "Každé 2 týdny" },
  { value: "monthly", label: "Každý měsíc" },
  { value: "yearly", label: "Každý rok" },
] as const;

export type Repeat = (typeof REPEAT_OPTIONS)[number]["value"];

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Nízká" },
  { value: "medium", label: "Střední" },
  { value: "high", label: "Vysoká" },
] as const;

export type Priority = (typeof PRIORITY_OPTIONS)[number]["value"];

export const repeatLabel = (value: string) =>
  REPEAT_OPTIONS.find((o) => o.value === value)?.label ?? "Neopakovat";

export const priorityLabel = (value: string) =>
  PRIORITY_OPTIONS.find((o) => o.value === value)?.label ?? "Střední";

export interface Occurrence {
  key: string;
  task: Task;
  date: string;
  done: boolean;
}

function* occurrenceDates(task: Task, end: string): Generator<string> {
  const start = task.dueDate;
  switch (task.repeat) {
    case "daily":
      for (let i = 0; i < 4000; i++) {
        const d = addDays(start, i);
        if (d > end) return;
        yield d;
      }
      return;
    case "weekdays": {
      let d = start;
      for (let i = 0; i < 4000 && d <= end; i++) {
        if (weekdayIndex(d) < 5) yield d;
        d = addDays(d, 1);
      }
      return;
    }
    case "weekly":
    case "biweekly": {
      const step = task.repeat === "weekly" ? 7 : 14;
      for (let i = 0; i < 1000; i++) {
        const d = addDays(start, i * step);
        if (d > end) return;
        yield d;
      }
      return;
    }
    case "monthly":
      for (let i = 0; i < 300; i++) {
        const d = addMonths(start, i);
        if (d > end) return;
        yield d;
      }
      return;
    case "yearly":
      for (let i = 0; i < 50; i++) {
        const d = addMonths(start, i * 12);
        if (d > end) return;
        yield d;
      }
      return;
    default:
      if (start <= end) yield start;
  }
}

export function expandTask(task: Task, from: string, to: string): Occurrence[] {
  const end =
    task.repeat !== "none" && task.repeatUntil && task.repeatUntil < to
      ? task.repeatUntil
      : to;
  const result: Occurrence[] = [];
  for (const date of occurrenceDates(task, end)) {
    if (date < from) continue;
    result.push({
      key: `${task.id}-${date}`,
      task,
      date,
      done: task.doneDates.includes(date),
    });
  }
  return result;
}

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function compareOccurrences(a: Occurrence, b: Occurrence) {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  const ta = a.task.dueTime ?? "99:99";
  const tb = b.task.dueTime ?? "99:99";
  if (ta !== tb) return ta < tb ? -1 : 1;
  return (
    (PRIORITY_RANK[a.task.priority] ?? 1) -
    (PRIORITY_RANK[b.task.priority] ?? 1)
  );
}
