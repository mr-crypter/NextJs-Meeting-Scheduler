"use client";
import { useState } from "react";

export default function BookSlot({ sellerId }: { sellerId: string }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [summary, setSummary] = useState("Meeting");
  const [msg, setMsg] = useState<string | null>(null);

  async function book() {
    setMsg(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, buyerId: "self", start, end, summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Booking failed");
      setMsg("Booked!");
      alert("Your meeting has been booked successfully.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed";
      setMsg(message);
    }
  }

  return (
    <div className="grid gap-2">
      <input className="border rounded p-2" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
      <input className="border rounded p-2" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
      <input className="border rounded p-2" placeholder="Summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
      <button onClick={book} className="px-3 py-2 rounded bg-blue-600 text-white">Book</button>
      {msg && <div className="text-sm">{msg}</div>}
    </div>
  );
}


