"use client";
import { useEffect, useState } from "react";

type Event = { id?: string | null; summary?: string | null; start?: { dateTime?: string }; end?: { dateTime?: string } };

export default function CalendarView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading calendar…</p>;
  if (!events.length) return <p className="text-sm text-gray-500">No upcoming events.</p>;

  return (
    <div className="grid gap-2">
      {events.map((e, idx) => (
        <div key={e.id ?? idx} className="p-3 border rounded">
          <div className="font-medium">{e.summary ?? "(no title)"}</div>
          <div className="text-sm text-gray-600">
            {e.start?.dateTime} → {e.end?.dateTime}
          </div>
        </div>
      ))}
    </div>
  );
}


