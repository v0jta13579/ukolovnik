interface SummaryCardsProps {
  todayOpen: number;
  todayTotal: number;
  weekOpen: number;
  monthDone: number;
  monthTotal: number;
}

export function SummaryCards({
  todayOpen,
  todayTotal,
  weekOpen,
  monthDone,
  monthTotal,
}: SummaryCardsProps) {
  const percent = monthTotal === 0 ? 0 : Math.round((monthDone / monthTotal) * 100);
  const items = [
    {
      label: "Dnes zbývá",
      value: todayOpen,
      hint: todayTotal === 0 ? "žádné úkoly" : `z ${todayTotal} úkolů`,
    },
    {
      label: "Příštích 7 dní",
      value: weekOpen,
      hint: "nedokončených úkolů",
    },
    {
      label: "Hotovo v měsíci",
      value: `${percent} %`,
      hint: `${monthDone} z ${monthTotal} úkolů`,
    },
  ];

  return (
    <dl className="grid grid-cols-3 gap-2 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-line bg-card px-3 py-3 shadow-sm sm:px-5 sm:py-4"
        >
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
            {item.label}
          </dt>
          <dd className="mt-1 font-serif text-2xl font-semibold tabular-nums text-primary sm:text-4xl">
            {item.value}
          </dd>
          <dd className="text-[11px] text-muted sm:text-xs">{item.hint}</dd>
        </div>
      ))}
    </dl>
  );
}
