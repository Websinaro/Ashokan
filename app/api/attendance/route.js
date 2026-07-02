import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireUser";
import Attendance from "@/lib/models/Attendance";

export async function GET(req) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const query = { user: user._id };
  if (from && to) {
    query.date = { $gte: from, $lte: to };
  }

  const records = await Attendance.find(query)
    .select("date went periods -_id")
    .lean();

  return NextResponse.json({ records });
}
