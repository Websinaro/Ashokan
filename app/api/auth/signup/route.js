import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { hashPassword, signSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const { name, collegeName, password } = await req.json();

    if (!name?.trim() || !collegeName?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, college name and password are all required." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json(
        { error: "That name is already registered. Try logging in instead." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      collegeName: collegeName.trim(),
      passwordHash,
    });

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
    console.error("[signup]", err);
    return NextResponse.json(
      { error: "Something went wrong while signing up." },
      { status: 500 }
    );
  }
}
