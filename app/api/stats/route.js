import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireUser";
import Attendance from "@/lib/models/Attendance";
import { todayKey } from "@/lib/date";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const records = await Attendance.find({ user: user._id }).lean();

  let presentDays = 0;
  let absentDays = 0;
  let markedDays = 0;
  let totalPeriods = 0;
  let attendedPeriods = 0;
  let missedPeriods = 0;

  for (const r of records) {
    if (r.went === true) {
      presentDays += 1;
      markedDays += 1;
    } else if (r.went === false) {
      absentDays += 1;
      markedDays += 1;
    }
    for (const p of r.periods || []) {
      if (p.attended === true) {
        totalPeriods += 1;
        attendedPeriods += 1;
      } else if (p.attended === false) {
        totalPeriods += 1;
        missedPeriods += 1;
      }
    }
  }

  const { semesterStart, semesterEnd } = user.settings;
  let semesterTotalDays = null;
  let elapsedDays = null;
  if (semesterStart && semesterEnd) {
    const start = new Date(semesterStart);
    const end = new Date(semesterEnd);
    const msPerDay = 1000 * 60 * 60 * 24;
    semesterTotalDays = Math.round((end - start) / msPerDay) + 1;
    const today = new Date(todayKey());
    const elapsed = Math.round((today - start) / msPerDay) + 1;
    elapsedDays = Math.max(0, Math.min(semesterTotalDays, elapsed));
  }

  const attendancePercent =
    markedDays > 0 ? Math.round((presentDays / markedDays) * 1000) / 10 : 0;
  const periodPercent =
    totalPeriods > 0 ? Math.round((attendedPeriods / totalPeriods) * 1000) / 10 : 0;

  return NextResponse.json({
    stats: {
      markedDays,
      presentDays,
      absentDays,
      attendancePercent,
      totalPeriods,
      attendedPeriods,
      missedPeriods,
      periodPercent,
      semesterTotalDays,
      elapsedDays,
    },
    settings: user.settings,
  });
}
