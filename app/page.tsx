import { asc } from "drizzle-orm";
import { connection } from "next/server";
import { Suspense } from "react";
import { Planner } from "@/components/planner";
import { todayInPrague } from "@/lib/dates";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";

async function PlannerLoader() {
  await connection();
  const allTasks = await db.select().from(tasks).orderBy(asc(tasks.dueDate));

  return <Planner tasks={allTasks} today={todayInPrague()} />;
}

function PlannerSkeleton() {
  return (
    <main
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12"
      aria-busy="true"
    >
      <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
        Úkolník
      </h1>
      <div className="h-24 animate-pulse rounded-xl bg-line/60" />
      <div className="h-[520px] animate-pulse rounded-2xl bg-line/60" />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PlannerSkeleton />}>
      <PlannerLoader />
    </Suspense>
  );
}
