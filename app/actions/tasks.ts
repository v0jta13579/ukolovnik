"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { inRange, isValidDate } from "@/lib/dates";
import { PRIORITY_OPTIONS, REPEAT_OPTIONS } from "@/lib/recurrence";
import type { TaskInput } from "@/lib/types";

function parseInput(raw: unknown): TaskInput {
  if (!raw || typeof raw !== "object") throw new Error("Neplatná data");
  const r = raw as Record<string, unknown>;

  const title = typeof r.title === "string" ? r.title.trim() : "";
  if (!title || title.length > 200) throw new Error("Neplatný název");

  const note = typeof r.note === "string" ? r.note.trim().slice(0, 1000) : "";

  if (!isValidDate(r.dueDate) || !inRange(r.dueDate)) {
    throw new Error("Datum musí být mezi listopadem 2026 a prosincem 2027");
  }
  const dueDate = r.dueDate;

  const dueTime =
    typeof r.dueTime === "string" && r.dueTime !== ""
      ? /^([01]\d|2[0-3]):[0-5]\d$/.test(r.dueTime)
        ? r.dueTime
        : (() => {
            throw new Error("Neplatný čas");
          })()
      : null;

  const priority = PRIORITY_OPTIONS.find((o) => o.value === r.priority)?.value;
  if (!priority) throw new Error("Neplatná priorita");

  const repeat = REPEAT_OPTIONS.find((o) => o.value === r.repeat)?.value;
  if (!repeat) throw new Error("Neplatné opakování");

  let repeatUntil: string | null = null;
  if (repeat !== "none" && r.repeatUntil) {
    if (!isValidDate(r.repeatUntil) || r.repeatUntil < dueDate) {
      throw new Error("Neplatné datum konce opakování");
    }
    repeatUntil = r.repeatUntil;
  }

  return { title, note, dueDate, dueTime, priority, repeat, repeatUntil };
}

function parseId(id: unknown) {
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
    throw new Error("Neplatné ID");
  }
  return id;
}

export async function createTask(raw: unknown) {
  const input = parseInput(raw);
  await db.insert(tasks).values(input);
  revalidatePath("/");
}

export async function updateTask(id: unknown, raw: unknown) {
  const taskId = parseId(id);
  const input = parseInput(raw);
  await db.update(tasks).set(input).where(eq(tasks.id, taskId));
  revalidatePath("/");
}

export async function deleteTask(id: unknown) {
  const taskId = parseId(id);
  await db.delete(tasks).where(eq(tasks.id, taskId));
  revalidatePath("/");
}

export async function toggleDone(id: unknown, date: unknown) {
  const taskId = parseId(id);
  if (!isValidDate(date)) throw new Error("Neplatné datum");
  await db
    .update(tasks)
    .set({
      doneDates: sql`CASE WHEN ${date} = ANY(${tasks.doneDates}) THEN array_remove(${tasks.doneDates}, ${date}) ELSE array_append(${tasks.doneDates}, ${date}) END`,
    })
    .where(eq(tasks.id, taskId));
  revalidatePath("/");
}
