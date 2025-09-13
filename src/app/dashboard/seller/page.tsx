import Navbar from "@/components/Navbar";
import CalendarView from "@/components/CalendarView";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function SellerDashboardPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");
  const [seller, googleAccount] = await Promise.all([
    prisma.seller.findUnique({ where: { userId: session.user.id } }),
    prisma.account.findFirst({ where: { userId: session.user.id, provider: "google" } }),
  ]);
  const isConnected = Boolean(seller?.encryptedRefresh || googleAccount?.access_token);
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-5xl p-4 grid gap-6">
        <h1 className="text-2xl font-semibold">Seller dashboard</h1>
        <p className="text-sm text-gray-600">Connect your calendar and view your availability.</p>
        {!isConnected ? (
          <div className="grid gap-2 p-4 border rounded">
            <div className="text-sm">Calendar is not connected.</div>
            <Link href="/api/auth/signin/google" className="px-3 py-2 rounded bg-blue-600 text-white w-max">Connect Google Calendar</Link>
          </div>
        ) : (
          <CalendarView />
        )}
      </main>
    </div>
  );
}


