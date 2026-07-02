import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  return NextResponse.json({ settings: user.settings });
}

export async function PUT(req) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json();
  const { semesterStart, semesterEnd, periodsPerDay, periodLabels } = body;

  if (semesterStart) user.settings.semesterStart = new Date(semesterStart);
  if (semesterEnd) user.settings.semesterEnd = new Date(semesterEnd);

  if (periodsPerDay) {
    const n = Math.max(1, Math.min(12, Number(periodsPerDay)));
    user.settings.periodsPerDay = n;

    // Keep periodLabels array in sync with the new count
    const current = user.settings.periodLabels || [];
    const next = [];
    for (let i = 0; i < n; i++) {
      next.push(current[i] || `Period ${i + 1}`);
    }
    user.settings.periodLabels = next;
  }

  if (Array.isArray(periodLabels) && periodLabels.length) {
    user.settings.periodLabels = periodLabels
      .slice(0, user.settings.periodsPerDay)
      .map((l, i) => l?.trim() || `Period ${i + 1}`);
  }

  if (user.settings.semesterStart && user.settings.semesterEnd) {
    if (new Date(user.settings.semesterEnd) <= new Date(user.settings.semesterStart)) {
      return NextResponse.json(
        { error: "Semester end date must be after the start date." },
        { status: 400 }
      );
    }
  }

  await user.save();
  return NextResponse.json({ settings: user.settings });
}
