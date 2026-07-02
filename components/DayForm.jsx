"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPretty } from "@/lib/date";

function ToggleButton({ value, current, onClick, tone, children }) {
  const active = current === value;
  const toneClasses =
    tone === "present"
      ? "border-present bg-present text-white"
      : "border-absent bg-absent text-white";
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
        active ? toneClasses : "border-line bg-white text-ink-soft hover:border-ink-soft"
      }`}
    >
      {children}
    </button>
  );
}

export default function DayForm({ date, editable, initialRecord, reason }) {
  const router = useRouter();
  const [went, setWent] = useState(initialRecord.went);
  const [periods, setPeriods] = useState(initialRecord.periods || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function updatePeriod(index, attended) {
    setPeriods((prev) => prev.map((p, i) => (i === index ? { ...p, attended } : p)));
  }

  function renamePeriod(index, label) {
    setPeriods((prev) => prev.map((p, i) => (i === index ? { ...p, label } : p)));
  }

  function removePeriod(index) {
    setPeriods((prev) =>
      prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, period: i + 1 }))
    );
  }

  function addPeriod() {
    setPeriods((prev) => [
      ...prev,
      { period: prev.length + 1, label: `Period ${prev.length + 1}`, attended: null },
    ]);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/attendance/${date}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ went, periods }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save. Try again.");
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

  if (!editable) {
    return (
      <div className="card p-6">
        <p className="mb-4 rounded-lg bg-paper-dim px-3.5 py-2.5 text-sm text-ink-soft">
          {reason}
        </p>
        <p className="label">Went to college</p>
        <p className="mb-4 text-sm font-semibold">
          {went === true ? "Yes" : went === false ? "No" : "Not marked"}
        </p>
        {periods.length > 0 && (
          <>
            <p className="label">Periods</p>
            <ul className="space-y-2">
              {periods.map((p) => (
                <li
                  key={p.period}
                  className="flex items-center justify-between rounded-lg border border-line px-3.5 py-2.5 text-sm"
                >
                  <span>{p.label}</span>
                  <span
                    className={`font-semibold ${
                      p.attended === true
                        ? "text-present"
                        : p.attended === false
                        ? "text-absent"
                        : "text-ink-soft"
                    }`}
                  >
                    {p.attended === true ? "Attended" : p.attended === false ? "Missed" : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <p className="label">Did you go to college?</p>
        <div className="flex gap-3">
          <ToggleButton value={true} current={went} onClick={setWent} tone="present">
            Yes, I went
          </ToggleButton>
          <ToggleButton value={false} current={went} onClick={setWent} tone="absent">
            No, I didn't
          </ToggleButton>
        </div>
      </div>

      {went === true && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="label !mb-0">Periods today</p>
            <button
              type="button"
              onClick={addPeriod}
              className="text-xs font-semibold text-indigo hover:underline"
            >
              + Add a period
            </button>
          </div>
          <p className="mb-4 text-xs text-ink-soft">
            Schedule changed today? Rename, add, or remove a period just for this day — your
            usual semester setup in Settings won't be affected.
          </p>

          <ul className="space-y-3">
            {periods.map((p, i) => (
              <li key={i} className="rounded-lg border border-line p-3.5">
                <div className="mb-2.5 flex items-center gap-2">
                  <input
                    className="input !py-1.5 !text-sm"
                    value={p.label}
                    onChange={(e) => renamePeriod(i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removePeriod(i)}
                    aria-label="Remove period"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft transition hover:bg-absent-light hover:text-absent"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-2">
                  <ToggleButton
                    value={true}
                    current={p.attended}
                    onClick={(v) => updatePeriod(i, v)}
                    tone="present"
                  >
                    Attended
                  </ToggleButton>
                  <ToggleButton
                    value={false}
                    current={p.attended}
                    onClick={(v) => updatePeriod(i, v)}
                    tone="absent"
                  >
                    Missed
                  </ToggleButton>
                </div>
              </li>
            ))}
            {periods.length === 0 && (
              <p className="rounded-lg bg-paper-dim px-3.5 py-3 text-sm text-ink-soft">
                No periods yet — add one above, or set your default periods in Settings.
              </p>
            )}
          </ul>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-absent-light px-3.5 py-2.5 text-sm text-absent">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving || went === null} className="btn-primary">
          {saving ? "Saving…" : "Save today's entry"}
        </button>
        {saved && <span className="text-sm font-medium text-present">Saved ✓</span>}
      </div>
    </div>
  );
}
