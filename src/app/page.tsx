import Navbar from "@/components/Navbar";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-5xl p-6 grid gap-6">
        <h1 className="text-3xl font-semibold">Welcome to Scheduler</h1>
        <p className="text-gray-600">Sign in and choose a role to continue.</p>
        <div className="flex items-center gap-3">
          <AuthButton />
          <Link href="/role" className="px-3 py-2 rounded border">Choose role</Link>
          <Link href="/dashboard/seller" className="px-3 py-2 rounded border">Seller dashboard</Link>
          <Link href="/dashboard/buyer" className="px-3 py-2 rounded border">Buyer dashboard</Link>
        </div>
      </main>
    </div>
  );
}
