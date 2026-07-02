"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toDateKey } from "@/lib/date";

function addMonths(dateStr, months) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setMonth(dt.getMonth() + months);
  return toDateKey(dt);
}

export default function SettingsForm({ initialSettings }) {
  const router = useRouter();
  const [semesterStart, setSemesterStart] = useState(
    initialSettings.semesterStart ? toDateKey(initialSettings.semesterStart) : ""
  );
  const [semesterEnd, setSemesterEnd] = useState(
    initialSettings.semesterEnd ? toDateKey(initialSettings.semesterEnd) : ""
  );
  const [periodsPerDay, setPeriodsPerDay] = useState(initialSettings.periodsPerDay || 6);
  const [periodLabels, setPeriodLabels] = useState(
    initialSettings.periodLabels?.length
      ? initialSettings.periodLabels
      : Array.from({ length: initialSettings.periodsPerDay || 6 }, (_, i) => `Period ${i + 1}`)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function handlePeriodsCountChange(n) {
    n = Math.max(1, Math.min(12, Number(n) || 1));
    setPeriodsPerDay(n);
    setPeriodLabels((prev) => {
      const next = [];
      for (let i = 0; i < n; i++) next.push(prev[i] || `Period ${i + 1}`);
      return next;
    });
  }

  function updateLabel(i, value) {
    setPeriodLabels((prev) => prev.map((l, idx) => (idx === i ? value : l)));
  }

  function useSixMonthDefault() {
    if (!semesterStart) return;
    setSemesterEnd(addMonths(semesterStart, 6));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semesterStart, semesterEnd, periodsPerDay, periodLabels }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save settings.");
        setSaving(false);
        return;
      }
      setSaved(true);
      setSaving(false);
      router.refresh();
    } catch (err) {
      setError("Couldn't reach the server.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="card p-6">
        <h2 className="mb-1 font-display text-lg font-semibold">Semester dates</h2>
        <p className="mb-5 text-sm text-ink-soft">
          Attendance can only be marked between these two dates.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="start">
              Semester start
            </label>
            <input
              id="start"
              type="date"
              className="input"
              value={semesterStart}
              onChange={(e) => setSemesterStart(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="end">
              Semester end
            </label>
            <input
              id="end"
              type="date"
              className="input"
              value={semesterEnd}
              onChange={(e) => setSemesterEnd(e.target.value)}
              required
            />
          </div>
        </div>
        <button
          type="button"
          onClick={useSixMonthDefault}
          disabled={!semesterStart}
          className="mt-3 text-xs font-semibold text-indigo hover:underline disabled:opacity-40"
        >
          Set end date to 6 months after start
        </button>
      </div>

      <div className="card p-6">
        <h2 className="mb-1 font-display text-lg font-semibold">Daily periods</h2>
        <p className="mb-5 text-sm text-ink-soft">
          Your default class schedule — shown each day you mark attendance. You can still adjust
          a single day from its own entry page.
        </p>

        <label className="label" htmlFor="periodsPerDay">
          Periods per day
        </label>
        <input
          id="periodsPerDay"
          type="number"
          min={1}
          max={12}
          className="input mb-4 max-w-[120px]"
          value={periodsPerDay}
          onChange={(e) => handlePeriodsCountChange(e.target.value)}
        />

        <label className="label">Period names</label>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {periodLabels.map((label, i) => (
            <input
              key={i}
              className="input"
              value={label}
              onChange={(e) => updateLabel(i, e.target.value)}
              placeholder={`Period ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-absent-light px-3.5 py-2.5 text-sm text-absent">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved && <span className="text-sm font-medium text-present">Saved ✓</span>}
      </div>
    </form>
  );
}
