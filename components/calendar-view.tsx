"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  MONTH_NAMES,
  MONTH_SHORT,
  RANGE_END,
  RANGE_START,
  WEEKDAY_SHORT,
  addDays,
  daysInMonth,
  listMonthKeys,
  monthKey,
  shiftMonthKey,
  splitDate,
  weekdayIndex,
} from "@/lib/dates";
import type { Occurrence } from "@/lib/recurrence";

const MONTH_KEYS = listMonthKeys();

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-high/12 text-high border-high/25",
  medium: "bg-medium/12 text-medium border-medium/25",
  low: "bg-low/12 text-low border-low/25",
};

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-high",
  medium: "bg-medium",
  low: "bg-low",
};

interface CalendarViewProps {
  month: string;
  today: string;
  selected: string | null;
  byDate: Map<string, Occurrence[]>;
  onMonthChange: (key: string) => void;
  onSelect: (date: string) => void;
}

export function CalendarView({
  month,
  today,
  selected,
  byDate,
  onMonthChange,
  onSelect,
}: CalendarViewProps) {
  const { y, m } = splitDate(`${month}-01`);
  const firstDate = `${month}-01`;
  const lead = weekdayIndex(firstDate);
  const total = daysInMonth(y, m);
  const cellCount = Math.ceil((lead + total) / 7) * 7;

  const cells = Array.from({ length: cellCount }, (_, i) => {
    const date = addDays(firstDate, i - lead);
    const inMonth = monthKey(date) === month;
    return { date, inMonth };
  });

  const canPrev = shiftMonthKey(month, -1) >= monthKey(RANGE_START);
  const canNext = shiftMonthKey(month, 1) <= monthKey(RANGE_END);

  return (
    <section
      aria-label="Kalendář"
      className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          {MONTH_NAMES[m - 1]} <span className="text-muted">{y}</span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonthKey(month, -1))}
            disabled={!canPrev}
            aria-label="Předchozí měsíc"
            className="flex size-9 items-center justify-center rounded-lg border border-line bg-card text-ink transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-card"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonthKey(month, 1))}
            disabled={!canNext}
            aria-label="Další měsíc"
            className="flex size-9 items-center justify-center rounded-lg border border-line bg-card text-ink transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-card"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <nav
        aria-label="Výběr měsíce"
        className="-mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-2"
      >
        {MONTH_KEYS.map((key) => {
          const { y: ky, m: km } = splitDate(`${key}-01`);
          const active = key === month;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onMonthChange(key)}
              aria-current={active ? "true" : undefined}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-card text-muted hover:border-primary/40 hover:text-ink"
              }`}
            >
              {MONTH_SHORT[km - 1]} {String(ky).slice(2)}
            </button>
          );
        })}
      </nav>

      <div className="mt-3 grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-line bg-line">
        {WEEKDAY_SHORT.map((d, i) => (
          <div
            key={d}
            className={`bg-paper px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide ${
              i >= 5 ? "text-high/80" : "text-muted"
            }`}
          >
            {d}
          </div>
        ))}
        {cells.map(({ date, inMonth }) => {
          const occurrences = byDate.get(date) ?? [];
          const isToday = date === today;
          const isSelected = date === selected;
          const weekend = weekdayIndex(date) >= 5;
          const day = splitDate(date).d;
          const inRange = date >= RANGE_START && date <= RANGE_END;
          const openCount = occurrences.filter((o) => !o.done).length;

          return (
            <button
              key={date}
              type="button"
              disabled={!inRange}
              onClick={() => onSelect(date)}
              aria-pressed={isSelected}
              aria-label={`${day}. ${MONTH_NAMES[splitDate(date).m - 1]} ${
                splitDate(date).y
              }, úkolů: ${occurrences.length}, nedokončených: ${openCount}`}
              className={`flex min-h-[64px] flex-col items-stretch gap-1 p-1.5 text-left transition sm:min-h-[104px] sm:p-2 ${
                inMonth ? "bg-card" : "bg-paper/70"
              } ${
                isSelected
                  ? "relative z-10 outline outline-2 -outline-offset-2 outline-primary"
                  : "hover:bg-primary-soft/50"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <span
                className={`flex size-6 items-center justify-center self-start rounded-full text-xs font-semibold tabular-nums ${
                  isToday
                    ? "bg-primary text-white"
                    : inMonth
                      ? weekend
                        ? "text-high/80"
                        : "text-ink"
                      : "text-muted/60"
                }`}
              >
                {day}
              </span>

              <span className="hidden flex-col gap-1 sm:flex">
                {occurrences.slice(0, 3).map((o) => (
                  <span
                    key={o.key}
                    className={`truncate rounded border px-1.5 py-0.5 text-[11px] leading-tight ${
                      PRIORITY_STYLES[o.task.priority] ?? PRIORITY_STYLES.medium
                    } ${o.done ? "line-through opacity-50" : ""}`}
                  >
                    {o.task.title}
                  </span>
                ))}
                {occurrences.length > 3 && (
                  <span className="px-1 text-[11px] font-medium text-muted">
                    +{occurrences.length - 3} další
                  </span>
                )}
              </span>

              {occurrences.length > 0 && (
                <span className="flex flex-wrap gap-0.5 sm:hidden" aria-hidden>
                  {occurrences.slice(0, 4).map((o) => (
                    <span
                      key={o.key}
                      className={`size-1.5 rounded-full ${
                        PRIORITY_DOT[o.task.priority] ?? PRIORITY_DOT.medium
                      } ${o.done ? "opacity-30" : ""}`}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted">
        Kalendář pokrývá období od 1. 11. 2026 do 31. 12. 2027. Klikni na den a
        uvidíš jeho úkoly v tabulce.
      </p>
    </section>
  );
}
