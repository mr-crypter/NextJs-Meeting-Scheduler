"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  if (loading) return <button className="px-3 py-2">…</button>;
  return session ? (
    <button onClick={() => signOut()} className="px-3 py-2 rounded bg-gray-900 text-white">Sign out</button>
  ) : (
    <button onClick={() => signIn("google")} className="px-3 py-2 rounded border">Sign in</button>
  );
}


