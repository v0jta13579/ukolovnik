import { sql } from "drizzle-orm";
import { date, index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    note: text("note").notNull().default(""),
    dueDate: date("due_date", { mode: "string" }).notNull(),
    dueTime: text("due_time"),
    priority: text("priority").notNull().default("medium"),
    repeat: text("repeat").notNull().default("none"),
    repeatUntil: date("repeat_until", { mode: "string" }),
    doneDates: text("done_dates")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("tasks_due_date_idx").on(table.dueDate)],
);
