"use client";

import { CalendarDays } from "lucide-react";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import {
  createTask,
  deleteTask,
  toggleDone,
  updateTask,
} from "@/app/actions/tasks";
import {
  RANGE_END,
  RANGE_START,
  addDays,
  formatCzLongDate,
  inRange,
  monthKey,
  MONTH_NAMES,
  splitDate,
} from "@/lib/dates";
import {
  compareOccurrences,
  expandTask,
  type Occurrence,
} from "@/lib/recurrence";
import type { Task, TaskInput } from "@/lib/types";
import { CalendarView } from "./calendar-view";
import { QuickAdd } from "./quick-add";
import { SummaryCards } from "./summary-cards";
import { TaskDialog } from "./task-dialog";
import { TaskTable } from "./task-table";

type Scope = "day" | "month" | "all";
type Status = "all" | "open" | "done";

interface DialogState {
  task: Task | null;
}

function clampMonth(key: string) {
  const first = monthKey(RANGE_START);
  const last = monthKey(RANGE_END);
  return key < first ? first : key > last ? last : key;
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; disabled?: boolean }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-lg border border-line bg-paper p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={o.disabled}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
            value === o.value
              ? "bg-card text-ink shadow-sm"
              : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Planner({ tasks, today }: { tasks: Task[]; today: string }) {
  const [month, setMonth] = useState(() => clampMonth(monthKey(today)));
  const [selected, setSelected] = useState<string | null>(
    inRange(today) ? today : null,
  );
  const [scope, setScope] = useState<Scope>(inRange(today) ? "day" : "month");
  const [status, setStatus] = useState<Status>("all");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [optimisticTasks, applyToggle] = useOptimistic(
    tasks,
    (state, change: { id: number; date: string }) =>
      state.map((t) =>
        t.id === change.id
          ? {
              ...t,
              doneDates: t.doneDates.includes(change.date)
                ? t.doneDates.filter((d) => d !== change.date)
                : [...t.doneDates, change.date],
            }
          : t,
      ),
  );

  const { occurrences, byDate } = useMemo(() => {
    const all = optimisticTasks
      .flatMap((t) => expandTask(t, RANGE_START, RANGE_END))
      .sort(compareOccurrences);
    const map = new Map<string, Occurrence[]>();
    for (const o of all) {
      const list = map.get(o.date);
      if (list) list.push(o);
      else map.set(o.date, [o]);
    }
    return { occurrences: all, byDate: map };
  }, [optimisticTasks]);

  const rows = useMemo(() => {
    return occurrences.filter((o) => {
      if (scope === "day" && selected && o.date !== selected) return false;
      if (scope === "month" && monthKey(o.date) !== month) return false;
      if (status === "open" && o.done) return false;
      if (status === "done" && !o.done) return false;
      return true;
    });
  }, [occurrences, scope, selected, month, status]);

  const summary = useMemo(() => {
    const todayList = byDate.get(today) ?? [];
    const weekEnd = addDays(today, 6);
    const weekOpen = occurrences.filter(
      (o) => !o.done && o.date >= today && o.date <= weekEnd,
    ).length;
    const monthList = occurrences.filter((o) => monthKey(o.date) === month);
    return {
      todayOpen: todayList.filter((o) => !o.done).length,
      todayTotal: todayList.length,
      weekOpen,
      monthDone: monthList.filter((o) => o.done).length,
      monthTotal: monthList.length,
    };
  }, [occurrences, byDate, today, month]);

  function handleSelectDay(date: string) {
    if (date === selected && scope === "day") {
      setSelected(null);
      setScope("month");
      return;
    }
    setSelected(date);
    setScope("day");
    setMonth(monthKey(date));
  }

  function handleMonthChange(key: string) {
    setMonth(key);
    setScope("month");
  }

  function runAction(action: () => Promise<unknown>) {
    setActionError(null);
    startTransition(async () => {
      try {
        await action();
      } catch {
        setActionError("Něco se nepovedlo. Zkus to prosím znovu.");
      }
    });
  }

  function handleToggle(id: number, date: string) {
    setActionError(null);
    startTransition(async () => {
      applyToggle({ id, date });
      try {
        await toggleDone(id, date);
      } catch {
        setActionError("Změnu se nepodařilo uložit. Zkus to prosím znovu.");
      }
    });
  }

  async function handleCreate(input: TaskInput) {
    await createTask(input);
    const { y, m } = splitDate(input.dueDate);
    setMonth(`${y}-${String(m).padStart(2, "0")}`);
    setSelected(input.dueDate);
    setScope("day");
  }

  async function handleDialogSubmit(input: TaskInput) {
    if (dialog?.task) {
      await updateTask(dialog.task.id, input);
    } else {
      await handleCreate(input);
    }
    setDialog(null);
  }

  function handleEdit(taskId: number) {
    const task = tasks.find((t) => t.id === taskId);
    if (task) setDialog({ task });
  }

  const defaultDate =
    selected ?? (inRange(today) ? today : `${month}-01`);

  const tableTitle =
    scope === "day" && selected
      ? formatCzLongDate(selected)
      : scope === "month"
        ? `${MONTH_NAMES[splitDate(`${month}-01`).m - 1]} ${splitDate(`${month}-01`).y}`
        : "Celé období 2026–2027";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-white">
            <CalendarDays className="size-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Úkolník
            </h1>
            <p className="text-sm text-muted">
              Plánuj úkoly do tabulky a měj je přehledně v kalendáři na konec
              roku 2026 i celý rok 2027.
            </p>
          </div>
        </div>
        <SummaryCards {...summary} />
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <CalendarView
          month={month}
          today={today}
          selected={selected}
          byDate={byDate}
          onMonthChange={handleMonthChange}
          onSelect={handleSelectDay}
        />

        <section
          aria-label="Tabulka úkolů"
          className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight">
                Tabulka úkolů
              </h2>
              <p className="text-sm text-muted">
                {tableTitle} · {rows.length}{" "}
                {rows.length === 1 ? "úkol" : rows.length >= 2 && rows.length <= 4 ? "úkoly" : "úkolů"}
              </p>
            </div>
          </div>

          <QuickAdd
            key={defaultDate}
            defaultDate={defaultDate}
            onAdd={handleCreate}
            onOpenDetail={() => setDialog({ task: null })}
          />

          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl<Scope>
              label="Rozsah tabulky"
              value={scope}
              onChange={setScope}
              options={[
                { value: "day", label: "Den", disabled: !selected },
                { value: "month", label: "Měsíc" },
                { value: "all", label: "Vše" },
              ]}
            />
            <SegmentedControl<Status>
              label="Filtr stavu"
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "Všechny" },
                { value: "open", label: "Nehotové" },
                { value: "done", label: "Hotové" },
              ]}
            />
          </div>

          {actionError && (
            <p role="alert" className="text-sm text-high">
              {actionError}
            </p>
          )}

          <TaskTable
            rows={rows}
            today={today}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={(id) => runAction(() => deleteTask(id))}
          />
        </section>
      </div>

      {dialog && (
        <TaskDialog
          key={dialog.task?.id ?? "new"}
          task={dialog.task}
          defaultDate={defaultDate}
          onClose={() => setDialog(null)}
          onSubmit={handleDialogSubmit}
        />
      )}
    </main>
  );
}
