export const RANGE_START = "2026-11-01";
export const RANGE_END = "2027-12-31";

export const MONTH_NAMES = [
  "Leden",
  "Únor",
  "Březen",
  "Duben",
  "Květen",
  "Červen",
  "Červenec",
  "Srpen",
  "Září",
  "Říjen",
  "Listopad",
  "Prosinec",
];

export const MONTH_SHORT = [
  "led",
  "úno",
  "bře",
  "dub",
  "kvě",
  "čvn",
  "čvc",
  "srp",
  "zář",
  "říj",
  "lis",
  "pro",
];

export const WEEKDAY_SHORT = ["po", "út", "st", "čt", "pá", "so", "ne"];

const pad = (n: number) => String(n).padStart(2, "0");

export function toDateString(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function splitDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

export function isValidDate(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const { y, m, d } = splitDate(s);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function addDays(s: string, n: number) {
  const { y, m, d } = splitDate(s);
  const date = new Date(Date.UTC(y, m - 1, d + n));
  return toDateString(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
}

export function addMonths(s: string, n: number) {
  const { y, m, d } = splitDate(s);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return toDateString(ny, nm, Math.min(d, daysInMonth(ny, nm)));
}

/** 0 = pondělí ... 6 = neděle */
export function weekdayIndex(s: string) {
  const { y, m, d } = splitDate(s);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

export function monthKey(s: string) {
  return s.slice(0, 7);
}

export function shiftMonthKey(key: string, n: number) {
  return addMonths(`${key}-01`, n).slice(0, 7);
}

export function inRange(s: string) {
  return s >= RANGE_START && s <= RANGE_END;
}

export function formatCzDate(s: string, withWeekday = true) {
  const { y, m, d } = splitDate(s);
  const base = `${d}. ${m}. ${y}`;
  return withWeekday ? `${WEEKDAY_SHORT[weekdayIndex(s)]} ${base}` : base;
}

export function formatCzLongDate(s: string) {
  const { y, m, d } = splitDate(s);
  return `${d}. ${MONTH_NAMES[m - 1].toLowerCase()} ${y}`;
}

export function listMonthKeys() {
  const keys: string[] = [];
  let key = monthKey(RANGE_START);
  const last = monthKey(RANGE_END);
  while (key <= last) {
    keys.push(key);
    key = shiftMonthKey(key, 1);
  }
  return keys;
}

export function todayInPrague() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Prague" }).format(
    new Date(),
  );
}
