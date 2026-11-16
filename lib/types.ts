import type { InferSelectModel } from "drizzle-orm";
import type { tasks } from "./db/schema";

export type Task = InferSelectModel<typeof tasks>;

export interface TaskInput {
  title: string;
  note: string;
  dueDate: string;
  dueTime: string | null;
  priority: string;
  repeat: string;
  repeatUntil: string | null;
}
