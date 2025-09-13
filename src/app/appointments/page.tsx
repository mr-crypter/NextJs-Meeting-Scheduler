import Navbar from "@/components/Navbar";
import AppointmentCard from "@/components/AppointmentCard";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SellerList from "@/components/SellerList";
import Link from "next/link";

type AppointmentDto = {
  id: string;
  start: string | Date;
  end: string | Date;
  summary?: string | null;
  buyer?: { name?: string | null } | null;
  seller?: { name?: string | null } | null;
  buyerId?: string;
  sellerId?: string;
};

async function getAppointments(): Promise<AppointmentDto[]> {
  const base = process.env.NEXT_PUBLIC_VERCEL_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/appointments`, { cache: "no-store" });
  const data = await res.json();
  return (Array.isArray(data) ? data : data.appointments) as AppointmentDto[];
}

export default async function AppointmentsPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");
  const appointments = await getAppointments();
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-5xl p-4 grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your appointments</h1>
          <Link href="/booking" className="px-3 py-2 rounded border">Go to Booking</Link>
        </div>
        <section className="grid gap-2">
          <h2 className="text-lg font-medium">Find a seller</h2>
          <SellerList />
        </section>
        <div className="grid gap-3">
          {appointments.map((a) => (
            <div key={a.id} className="border rounded p-3 grid gap-1">
              <AppointmentCard appt={{ id: a.id, start: a.start, end: a.end, summary: a.summary ?? "Meeting" }} />
              <div className="text-sm text-gray-600">Buyer: {a.buyer?.name ?? a.buyerId}</div>
              <div className="text-sm text-gray-600">Seller: {a.seller?.name ?? a.sellerId}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}


