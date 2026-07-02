import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/requireUser";
import Attendance from "@/lib/models/Attendance";
import Navbar from "@/components/Navbar";
import Calendar from "@/components/Calendar";
import { toDateKey } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const records = await Attendance.find({ user: user._id })
    .select("date went periods -_id")
    .lean();

  const recordsByDate = {};
  for (const r of records) recordsByDate[r.date] = r;

  const hasSettings = Boolean(user.settings.semesterStart && user.settings.semesterEnd);

  return (
    <div className="min-h-screen">
      <Navbar user={{ name: user.name, collegeName: user.collegeName }} />

      <main className="mx-auto max-w-5xl px-6 py-8 sm:py-10">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">
              {user.collegeName}
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Your attendance calendar
            </h1>
          </div>
        </div>

        {!hasSettings && (
          <div className="card mb-6 flex flex-col items-start gap-3 border-indigo/20 bg-indigo/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink">
              Set your semester dates and daily periods to start tracking attendance.
            </p>
            <Link href="/settings" className="btn-primary whitespace-nowrap !px-4 !py-2 text-xs">
              Set up semester
            </Link>
          </div>
        )}

        <Calendar
          recordsByDate={recordsByDate}
          semesterStart={
            user.settings.semesterStart ? toDateKey(user.settings.semesterStart) : null
          }
          semesterEnd={user.settings.semesterEnd ? toDateKey(user.settings.semesterEnd) : null}
        />
      </main>
    </div>
  );
}
