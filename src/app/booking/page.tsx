import Navbar from "@/components/Navbar";
import BookingFlow from "@/components/BookingFlow";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BookingPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-5xl p-4 grid gap-6">
        <h1 className="text-2xl font-semibold">Book an appointment</h1>
        <BookingFlow />
      </main>
    </div>
  );
}


