"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "@/components/AuthButton";

export default function Navbar() {
  const pathname = usePathname();
  const linkClass = (href: string) =>
    `px-3 py-2 rounded ${pathname === href ? "bg-gray-200" : "hover:bg-gray-100"}`;
  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto max-w-5xl flex items-center justify-between p-3">
        <Link href="/" className="font-semibold">Scheduler</Link>
        <div className="flex items-center gap-2">
          <Link href="/role" className={linkClass("/role")}>Role</Link>
          <Link href="/dashboard/seller" className={linkClass("/dashboard/seller")}>Seller</Link>
          <Link href="/dashboard/buyer" className={linkClass("/dashboard/buyer")}>Buyer</Link>
          <Link href="/booking" className={linkClass("/booking")}>Booking</Link>
          <Link href="/appointments" className={linkClass("/appointments")}>Appointments</Link>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}


