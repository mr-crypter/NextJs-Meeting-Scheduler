import Navbar from "@/components/Navbar";
import CalendarView from "@/components/CalendarView";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function SellerDashboardPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");
  const seller = await (prisma as any).seller.findUnique({ where: { userId: session.user.id } });
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-5xl p-4 grid gap-6">
        <h1 className="text-2xl font-semibold">Seller dashboard</h1>
        <p className="text-sm text-gray-600">Connect your calendar and view your availability.</p>
        {!seller ? (
          <div className="grid gap-2 p-4 border rounded">
            <div className="text-sm">Calendar is not connected.</div>
            <a href="/api/auth/signin/google" className="px-3 py-2 rounded bg-blue-600 text-white w-max">Connect Google Calendar</a>
          </div>
        ) : (
          <CalendarView />
        )}
      </main>
    </div>
  );
}


