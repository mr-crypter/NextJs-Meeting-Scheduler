"use client";
import { useEffect, useMemo, useState } from "react";

type Seller = { id: string; name: string | null; email: string | null; image?: string | null };
type Busy = { start: string; end: string };

function toIso(d: Date) {
  return new Date(d).toISOString();
}

function generateSlots(timeMinIso: string, timeMaxIso: string, busy: Busy[], slotMinutes = 30) {
  const slots: { start: string; end: string; isBusy: boolean }[] = [];
  const start = new Date(timeMinIso);
  const end = new Date(timeMaxIso);

  // Work hours 9:00 - 17:00 local time
  const workStartHour = 9;
  const workEndHour = 17;

  const busyRanges = busy.map(b => [new Date(b.start).getTime(), new Date(b.end).getTime()] as const);

  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const dayStart = new Date(day);
    dayStart.setHours(workStartHour, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(workEndHour, 0, 0, 0);
    for (let t = dayStart.getTime(); t < dayEnd.getTime(); t += slotMinutes * 60 * 1000) {
      const s = new Date(t);
      const e = new Date(t + slotMinutes * 60 * 1000);
      if (s < new Date()) continue; // skip past
      const overlapsBusy = busyRanges.some(([bs, be]) => !(e.getTime() <= bs || s.getTime() >= be));
      slots.push({ start: s.toISOString(), end: e.toISOString(), isBusy: overlapsBusy });
    }
  }
  return slots.slice(0, 200); // cap
}

export default function BookingFlow() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<string>("");
  const [busy, setBusy] = useState<Busy[]>([]);
  const [loadingBusy, setLoadingBusy] = useState(false);
  const [summary, setSummary] = useState("Meeting");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sellers")
      .then(r => r.json())
      .then((data: Seller[]) => setSellers(data));
  }, []);

  const { timeMin, timeMax } = useMemo(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    return { timeMin: toIso(start), timeMax: toIso(end) };
  }, []);

  useEffect(() => {
    if (!selectedSellerId) return;
    setLoadingBusy(true);
    setMessage(null);
    fetch(`/api/sellers/${selectedSellerId}/availability?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`)
      .then(r => r.json())
      .then((data) => setBusy(data.busy ?? []))
      .catch((e) => setMessage(e?.message ?? "Failed to load availability"))
      .finally(() => setLoadingBusy(false));
  }, [selectedSellerId, timeMin, timeMax]);

  const slots = useMemo(() => generateSlots(timeMin, timeMax, busy, 30), [timeMin, timeMax, busy]);

  async function book(start: string, end: string) {
    setMessage(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: selectedSellerId, start, end, summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Booking failed");
      setMessage("Booked successfully. Check Appointments tab and calendars.");
      alert("Your meeting has been booked successfully.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Booking failed";
      setMessage(message);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm text-gray-700">Select a seller</label>
        <select className="border rounded p-2" value={selectedSellerId} onChange={(e) => setSelectedSellerId(e.target.value)}>
          <option value="">-- choose --</option>
          {sellers.map(s => (
            <option key={s.id} value={s.id}>{s.name ?? s.email ?? s.id}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-gray-700">Title</label>
        <input className="border rounded p-2" value={summary} onChange={(e) => setSummary(e.target.value)} />
      </div>
      {selectedSellerId ? (
        <div className="grid gap-2">
          <div className="text-sm text-gray-700">Available slots (next 7 days)</div>
          {loadingBusy ? (
            <div>Loading availability…</div>
          ) : slots.length === 0 ? (
            <div className="text-sm text-gray-500">No available slots.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {slots.map((slot, idx) => {
                const isBusy = slot.isBusy;
                const base = "text-left border rounded p-2";
                const availableCls = "hover:bg-gray-50 border-gray-200";
                const busyCls = "bg-red-100 border-red-300 text-red-800 cursor-not-allowed opacity-60";
                return (
                  <button
                    key={idx}
                    onClick={() => !isBusy && book(slot.start, slot.end)}
                    disabled={isBusy}
                    className={`${base} ${isBusy ? busyCls : availableCls}`}
                    aria-disabled={isBusy}
                    aria-label={isBusy ? "Slot unavailable (busy)" : "Book this slot"}
                  >
                    <div className="font-medium">{new Date(slot.start).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">→ {new Date(slot.end).toLocaleTimeString()}</div>
                    {isBusy && <div className="text-xs mt-1">Busy</div>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-500">Choose a seller to load availability.</div>
      )}
      {message && <div className="text-sm">{message}</div>}
    </div>
  );
}


