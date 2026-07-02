import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { verifyPassword, signSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const { name, password } = await req.json();

    if (!name?.trim() || !password) {
      return NextResponse.json(
        { error: "Name and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ name: name.trim() });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with that name." },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 }
      );
    }

    const token = signSessionToken({ userId: user._id.toString() });
    setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        collegeName: user.collegeName,
        settings: user.settings,
      },
    });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json(
      { error: "Something went wrong while logging in." },
      { status: 500 }
    );
  }
}
