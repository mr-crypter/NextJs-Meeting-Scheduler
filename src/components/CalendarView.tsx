"use client";
import { useEffect, useMemo, useState } from "react";

type Event = { id?: string | null; summary?: string | null; start?: { dateTime?: string }; end?: { dateTime?: string } };

function startOfMonth(d: Date) {
  const x = new Date(d);
  x.setDate(1); x.setHours(0,0,0,0);
  return x;
}
function endOfMonth(d: Date) {
  const x = new Date(d);
  x.setMonth(x.getMonth()+1, 0); x.setHours(23,59,59,999);
  return x;
}
function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

export default function CalendarView() {
  const [cursor, setCursor] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const { timeMin, timeMax, daysGrid, monthLabel } = useMemo(() => {
    const s = startOfMonth(cursor);
    const e = endOfMonth(cursor);
    const firstWeekday = new Date(s).getDay(); // 0-6, Sun-Sat
    const totalDays = e.getDate();
    const days: { date: Date; iso: string }[] = [];
    // Fill leading blanks from previous month
    for (let i=0;i<firstWeekday;i++) days.push({ date: new Date(NaN), iso: "" });
    for (let d=1; d<=totalDays; d++) {
      const day = new Date(s.getFullYear(), s.getMonth(), d);
      days.push({ date: day, iso: day.toISOString() });
    }
    const label = s.toLocaleString(undefined, { month: "long", year: "numeric" });
    return { timeMin: s.toISOString(), timeMax: e.toISOString(), daysGrid: days, monthLabel: label };
  }, [cursor]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/calendar?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`)
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .finally(() => setLoading(false));
  }, [timeMin, timeMax]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const ev of events) {
      const dt = ev.start?.dateTime;
      if (!dt) continue;
      const dayIso = new Date(dt).toISOString().slice(0,10);
      const arr = map.get(dayIso) ?? [];
      arr.push(ev);
      map.set(dayIso, arr);
    }
    return map;
  }, [events]);

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <button className="px-2 py-1 border rounded" onClick={() => setCursor(addMonths(cursor, -1))}>← Prev</button>
        <div className="font-semibold">{monthLabel}</div>
        <button className="px-2 py-1 border rounded" onClick={() => setCursor(addMonths(cursor, 1))}>Next →</button>
      </div>
      {loading ? (
        <div>Loading calendar…</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(l => (
            <div key={l} className="text-xs font-medium text-gray-600">{l}</div>
          ))}
          {daysGrid.map((d, idx) => {
            const isBlank = Number.isNaN(d.date.getTime());
            const dayKey = !isBlank ? d.date.toISOString().slice(0,10) : `${idx}`;
            const dayEvents = !isBlank ? (eventsByDay.get(dayKey) ?? []) : [];
            return (
              <div key={dayKey} className={`min-h-24 border rounded p-2 grid gap-1 ${isBlank ? "bg-gray-50" : ""}`}>
                {!isBlank && (
                  <div className="text-xs text-gray-500">{d.date.getDate()}</div>
                )}
                <div className="grid gap-1">
                  {dayEvents.slice(0,3).map((e, i) => (
                    <div key={e.id ?? i} className="text-xs truncate bg-blue-50 border border-blue-200 rounded px-1 py-0.5">
                      {e.summary ?? "(no title)"}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-gray-600">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


