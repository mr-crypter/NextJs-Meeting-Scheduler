import Navbar from "@/components/Navbar";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getServerAuthSession();
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-5xl p-6 grid gap-6">
        <h1 className="text-3xl font-semibold">Welcome to Scheduler</h1>
        <p className="text-gray-600">Sign in to continue.</p>
        <div className="flex items-center gap-3">
          <AuthButton />
          {session ? (
            <>
              <Link href="/role" className="px-3 py-2 rounded border">Choose role</Link>
              <Link href="/booking" className="px-3 py-2 rounded border">Booking</Link>
              <Link href="/appointments" className="px-3 py-2 rounded border">Appointments</Link>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
