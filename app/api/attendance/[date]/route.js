import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireUser";
import Attendance from "@/lib/models/Attendance";
import { todayKey } from "@/lib/date";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req, { params }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { date } = params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  let record = await Attendance.findOne({ user: user._id, date }).lean();

  if (!record) {
    // Build a default (unsaved) shape from the user's current period settings
    const labels = user.settings.periodLabels?.length
      ? user.settings.periodLabels
      : Array.from({ length: user.settings.periodsPerDay }, (_, i) => `Period ${i + 1}`);

    record = {
      date,
      went: null,
      periods: labels.map((label, i) => ({ period: i + 1, label, attended: null })),
      _isNew: true,
    };
  }

  return NextResponse.json({
    record,
    isToday: date === todayKey(),
    semesterStart: user.settings.semesterStart,
    semesterEnd: user.settings.semesterEnd,
  });
}

export async function PUT(req, { params }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { date } = params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  // Hard rule: only today's entry may be created or edited.
  if (date !== todayKey()) {
    return NextResponse.json(
      { error: "Only today's entry can be added or changed." },
      { status: 403 }
    );
  }

  const { semesterStart, semesterEnd } = user.settings;
  if (semesterStart && date < semesterStart.toISOString().slice(0, 10)) {
    return NextResponse.json(
      { error: "This date is before your semester starts." },
      { status: 403 }
    );
  }
  if (semesterEnd && date > semesterEnd.toISOString().slice(0, 10)) {
    return NextResponse.json(
      { error: "This date is after your semester ends." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { went, periods } = body;

  const cleanPeriods = Array.isArray(periods)
    ? periods.map((p, i) => ({
        period: Number(p.period) || i + 1,
        label: (p.label || `Period ${i + 1}`).toString().trim(),
        attended: typeof p.attended === "boolean" ? p.attended : null,
      }))
    : [];

  const record = await Attendance.findOneAndUpdate(
    { user: user._id, date },
    {
      user: user._id,
      date,
      went: typeof went === "boolean" ? went : null,
      periods: cleanPeriods,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({ record });
}
