"use client";

import { Pencil, Repeat, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatCzDate } from "@/lib/dates";
import {
  priorityLabel,
  repeatLabel,
  type Occurrence,
} from "@/lib/recurrence";

const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-high/12 text-high",
  medium: "bg-medium/12 text-medium",
  low: "bg-low/12 text-low",
};

interface TaskTableProps {
  rows: Occurrence[];
  today: string;
  onToggle: (taskId: number, date: string) => void;
  onEdit: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}

export function TaskTable({
  rows,
  today,
  onToggle,
  onEdit,
  onDelete,
}: TaskTableProps) {
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-paper/60 px-4 py-10 text-center">
        <p className="font-serif text-lg font-semibold">Tady je zatím prázdno</p>
        <p className="mt-1 text-sm text-muted">
          Přidej první úkol pomocí řádku nahoře.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="bg-paper text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <th scope="col" className="w-10 px-3 py-2.5">
              <span className="sr-only">Hotovo</span>
            </th>
            <th scope="col" className="px-3 py-2.5">
              Úkol
            </th>
            <th scope="col" className="px-3 py-2.5">
              Datum
            </th>
            <th scope="col" className="px-3 py-2.5">
              Priorita
            </th>
            <th scope="col" className="px-3 py-2.5">
              Opakování
            </th>
            <th scope="col" className="w-24 px-3 py-2.5 text-right">
              <span className="sr-only">Akce</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-card">
          {rows.map((o) => {
            const overdue = !o.done && o.date < today;
            const isToday = o.date === today;
            const confirming = confirmingId === o.task.id;
            return (
              <tr
                key={o.key}
                className={`transition ${isToday ? "bg-primary-soft/40" : "hover:bg-paper/60"}`}
              >
                <td className="px-3 py-3 align-top">
                  <input
                    type="checkbox"
                    checked={o.done}
                    onChange={() => onToggle(o.task.id, o.date)}
                    aria-label={`Hotovo: ${o.task.title}`}
                    className="mt-0.5 size-4 cursor-pointer accent-primary"
                  />
                </td>
                <td className="max-w-[320px] px-3 py-3 align-top">
                  <p
                    className={`font-medium ${o.done ? "text-muted line-through" : ""}`}
                  >
                    {o.task.title}
                  </p>
                  {o.task.note && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                      {o.task.note}
                    </p>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-3 align-top tabular-nums">
                  <span className={overdue ? "font-semibold text-high" : ""}>
                    {formatCzDate(o.date)}
                  </span>
                  {o.task.dueTime && (
                    <span className="ml-1.5 text-muted">{o.task.dueTime}</span>
                  )}
                  {isToday && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                      dnes
                    </span>
                  )}
                  {overdue && (
                    <span className="ml-2 text-[10px] font-semibold uppercase text-high">
                      po termínu
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 align-top">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      PRIORITY_BADGE[o.task.priority] ?? PRIORITY_BADGE.medium
                    }`}
                  >
                    {priorityLabel(o.task.priority)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 align-top text-muted">
                  {o.task.repeat !== "none" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Repeat className="size-3.5 text-primary" aria-hidden />
                      {repeatLabel(o.task.repeat)}
                    </span>
                  ) : (
                    <span aria-label="Neopakuje se">–</span>
                  )}
                </td>
                <td className="px-3 py-3 align-top">
                  {confirming ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingId(null);
                          onDelete(o.task.id);
                        }}
                        className="rounded-md bg-high px-2 py-1 text-xs font-semibold text-white"
                      >
                        {o.task.repeat !== "none" ? "Smazat sérii" : "Smazat"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="rounded-md border border-line px-2 py-1 text-xs"
                      >
                        Ne
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(o.task.id)}
                        aria-label={`Upravit: ${o.task.title}`}
                        className="flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-primary-soft hover:text-ink"
                      >
                        <Pencil className="size-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(o.task.id)}
                        aria-label={`Smazat: ${o.task.title}`}
                        className="flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-high/10 hover:text-high"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
