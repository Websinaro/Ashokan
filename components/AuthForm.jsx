"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [form, setForm] = useState({ name: "", collegeName: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Couldn't reach the server. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-indigo font-display text-lg font-semibold text-paper">
          L
        </span>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {isSignup ? "Open your ledger" : "Welcome back"}
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          {isSignup
            ? "One entry sets up your account — no email needed."
            : "Sign in with the name and password you set up."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <div>
          <label className="label" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            className="input"
            placeholder="e.g. Aditi Sharma"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        {isSignup && (
          <div>
            <label className="label" htmlFor="collegeName">
              College name
            </label>
            <input
              id="collegeName"
              className="input"
              placeholder="e.g. St. Xavier's College"
              value={form.collegeName}
              onChange={(e) => update("collegeName", e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            minLength={6}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-absent-light px-3 py-2 text-sm text-absent">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
        </button>

        <p className="text-center text-xs text-ink-soft">
          Stays signed in on this device for 30 days.
        </p>
      </form>

      <p className="mt-5 text-center text-sm text-ink-soft">
        {isSignup ? "Already have an account?" : "First time here?"}{" "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-indigo hover:underline">
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
