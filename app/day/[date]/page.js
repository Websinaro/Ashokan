import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireUser } from "@/lib/requireUser";
import Attendance from "@/lib/models/Attendance";
import Navbar from "@/components/Navbar";
import DayForm from "@/components/DayForm";
import { todayKey, formatPretty, toDateKey } from "@/lib/date";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function DayPage({ params }) {
  const { date } = params;
  if (!DATE_RE.test(date)) notFound();

  const user = await requireUser();
  if (!user) redirect("/login");

  const today = todayKey();
  let reason = "";
  let editable = date === today;

  if (date > today) reason = "This day hasn't happened yet — check back on the day itself.";
  if (date < today) reason = "Past days are locked to keep your record accurate.";

  const { semesterStart, semesterEnd } = user.settings;
  if (semesterStart && date < toDateKey(semesterStart)) {
    editable = false;
    reason = "This date is before your semester starts.";
  }
  if (semesterEnd && date > toDateKey(semesterEnd)) {
    editable = false;
    reason = "This date is after your semester ends.";
  }

  let record = await Attendance.findOne({ user: user._id, date }).lean();
  if (!record) {
    const labels = user.settings.periodLabels?.length
      ? user.settings.periodLabels
      : Array.from({ length: user.settings.periodsPerDay || 6 }, (_, i) => `Period ${i + 1}`);
    record = {
      date,
      went: null,
      periods: labels.map((label, i) => ({ period: i + 1, label, attended: null })),
    };
  }

  return (
    <div className="min-h-screen">
      <Navbar user={{ name: user.name, collegeName: user.collegeName }} />
      <main className="mx-auto max-w-2xl px-6 py-8 sm:py-10">
        <Link href="/dashboard" className="mb-4 inline-block text-sm text-ink-soft hover:text-indigo">
          ← Back to calendar
        </Link>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">
          {editable ? "Today" : date > today ? "Upcoming" : "Past entry"}
        </p>
        <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {formatPretty(date)}
        </h1>

        <DayForm
          date={date}
          editable={editable}
          initialRecord={{ went: record.went, periods: record.periods }}
          reason={reason}
        />
      </main>
    </div>
  );
}
