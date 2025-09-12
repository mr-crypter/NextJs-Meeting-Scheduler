"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function RoleSelect() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function setRole(role: "BUYER" | "SELLER") {
    if (!session?.user?.id) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, role }),
      });
      if (!res.ok) throw new Error("Failed to set role");
      setMessage(`Role set to ${role}. If SELLER, sign in again to grant calendar scopes.`);
    } catch (e: any) {
      setMessage(e.message ?? "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button disabled={saving} onClick={() => setRole("BUYER")} className="px-3 py-2 rounded border">I'm a buyer</button>
      <button disabled={saving} onClick={() => setRole("SELLER")} className="px-3 py-2 rounded border">I'm a seller</button>
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
}


