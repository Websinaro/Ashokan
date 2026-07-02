import { redirect } from "next/navigation";
import { requireUser } from "@/lib/requireUser";
import Attendance from "@/lib/models/Attendance";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import { todayKey } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const records = await Attendance.find({ user: user._id }).lean();

  let presentDays = 0;
  let absentDays = 0;
  let attendedPeriods = 0;
  let missedPeriods = 0;
  const periodTotals = {}; // label -> { attended, missed }

  for (const r of records) {
    if (r.went === true) presentDays += 1;
    else if (r.went === false) absentDays += 1;

    for (const p of r.periods || []) {
      if (!periodTotals[p.label]) periodTotals[p.label] = { attended: 0, missed: 0 };
      if (p.attended === true) {
        attendedPeriods += 1;
        periodTotals[p.label].attended += 1;
      } else if (p.attended === false) {
        missedPeriods += 1;
        periodTotals[p.label].missed += 1;
      }
    }
  }

  const markedDays = presentDays + absentDays;
  const totalPeriods = attendedPeriods + missedPeriods;
  const dayPercent = markedDays > 0 ? Math.round((presentDays / markedDays) * 1000) / 10 : 0;
  const periodPercent =
    totalPeriods > 0 ? Math.round((attendedPeriods / totalPeriods) * 1000) / 10 : 0;

  const { semesterStart, semesterEnd } = user.settings;
  let semesterTotalDays = null;
  let daysRemaining = null;
  if (semesterStart && semesterEnd) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const start = new Date(semesterStart);
    const end = new Date(semesterEnd);
    semesterTotalDays = Math.round((end - start) / msPerDay) + 1;
    const today = new Date(todayKey());
    daysRemaining = Math.max(0, Math.round((end - today) / msPerDay));
  }

  return (
    <div className="min-h-screen">
      <Navbar user={{ name: user.name, collegeName: user.collegeName }} />
      <main className="mx-auto max-w-4xl px-6 py-8 sm:py-10">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">
          {user.collegeName}
        </p>
        <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Your statistics
        </h1>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Marked days" value={markedDays} tone="indigo" />
          <StatCard label="Present days" value={presentDays} tone="present" />
          <StatCard label="Absent days" value={absentDays} tone="absent" />
          <StatCard label="Day attendance" value={dayPercent} suffix="%" tone="ink" />
        </div>

        <div className="card mb-6 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Day-level attendance</h2>
            <span className="font-mono text-sm text-ink-soft">
              {presentDays} / {markedDays || 0}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-paper-dim">
            <div
              className="h-full rounded-full bg-present transition-all"
              style={{ width: `${dayPercent}%` }}
            />
          </div>

          <div className="mt-6 mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Period-level attendance</h2>
            <span className="font-mono text-sm text-ink-soft">
              {attendedPeriods} / {totalPeriods || 0}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-paper-dim">
            <div
              className="h-full rounded-full bg-indigo transition-all"
              style={{ width: `${periodPercent}%` }}
            />
          </div>
        </div>

        {Object.keys(periodTotals).length > 0 && (
          <div className="card mb-6 p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">By period</h2>
            <ul className="space-y-3">
              {Object.entries(periodTotals).map(([label, t]) => {
                const total = t.attended + t.missed;
                const pct = total > 0 ? Math.round((t.attended / total) * 100) : 0;
                return (
                  <li key={label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{label}</span>
                      <span className="font-mono text-ink-soft">
                        {t.attended}/{total} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-paper-dim">
                      <div
                        className="h-full rounded-full bg-present"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {semesterTotalDays && (
          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Semester</h2>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="label !mb-1">Total length</p>
                <p className="font-mono text-lg">{semesterTotalDays} days</p>
              </div>
              <div>
                <p className="label !mb-1">Days remaining</p>
                <p className="font-mono text-lg">{daysRemaining} days</p>
              </div>
              <div>
                <p className="label !mb-1">Unmarked days</p>
                <p className="font-mono text-lg">
                  {Math.max(0, semesterTotalDays - markedDays - daysRemaining)}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
