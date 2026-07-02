"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toDateKey, todayKey } from "@/lib/date";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function dayStatus(record) {
  if (!record) return "unmarked";
  if (record.went === true) return "present";
  if (record.went === false) return "absent";
  return "unmarked";
}

export default function Calendar({ recordsByDate, semesterStart, semesterEnd }) {
  const router = useRouter();
  const today = todayKey();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const list = [];
    for (let i = 0; i < startOffset; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(toDateKey(new Date(viewYear, viewMonth, d)));
    }
    return list;
  }, [viewYear, viewMonth]);

  function changeMonth(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  function inSemester(dateKey) {
    if (!semesterStart || !semesterEnd) return true;
    return dateKey >= semesterStart && dateKey <= semesterEnd;
  }

  return (
    <div className="card p-5 sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
          {monthLabel}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-indigo hover:text-indigo"
          >
            ‹
          </button>
          <button
            onClick={() => {
              setViewMonth(now.getMonth());
              setViewYear(now.getFullYear());
            }}
            className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink-soft transition hover:border-indigo hover:text-indigo"
          >
            Today
          </button>
          <button
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-indigo hover:text-indigo"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-soft sm:gap-2">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-1.5 sm:gap-2">
        {cells.map((dateKey, idx) => {
          if (!dateKey) return <div key={idx} />;

          const isToday = dateKey === today;
          const isFuture = dateKey > today;
          const isPast = dateKey < today;
          const record = recordsByDate[dateKey];
          const status = dayStatus(record);
          const semesterOk = inSemester(dateKey);
          const dayNum = Number(dateKey.slice(-2));

          const clickable = isToday && semesterOk;

          const base =
            "relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition select-none";

          let styles = "border-transparent text-ink-soft/40";
          if (semesterOk) {
            if (status === "present") styles = "border-present/30 bg-present-light text-present";
            else if (status === "absent") styles = "border-absent/30 bg-absent-light text-absent";
            else if (isPast) styles = "border-line bg-paper-dim/60 text-ink-soft";
            else if (isFuture) styles = "border-line/60 text-ink-soft/50";
            else styles = "border-line text-ink";
          }

          return (
            <button
              key={dateKey}
              disabled={!clickable}
              onClick={() => clickable && router.push(`/day/${dateKey}`)}
              className={`${base} ${styles} ${
                clickable ? "cursor-pointer ring-2 ring-indigo/0 hover:ring-indigo/40" : "cursor-default"
              } ${isToday && semesterOk ? "font-bold" : ""}`}
              title={
                !semesterOk
                  ? "Outside your semester range"
                  : isToday
                  ? "Mark today's attendance"
                  : isFuture
                  ? "Future day — can't be marked yet"
                  : status === "unmarked"
                  ? "Not marked"
                  : undefined
              }
            >
              {isToday && semesterOk && (
                <span className="absolute inset-0 rounded-lg animate-pulse-ring" />
              )}
              <span>{dayNum}</span>
              {status !== "unmarked" && semesterOk && (
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                    status === "present" ? "bg-present" : "bg-absent"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-4 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-present" /> Present
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-absent" /> Absent
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-line" /> Not marked
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-semibold text-indigo">
          <span className="h-2 w-2 rounded-full bg-indigo animate-pulse-ring" /> Today — tap to mark
        </span>
      </div>
    </div>
  );
}
