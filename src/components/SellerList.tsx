"use client";
import { useEffect, useState } from "react";

type Seller = { id: string; name?: string | null; email?: string | null };

export default function SellerList() {
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    fetch("/api/sellers")
      .then((res) => res.json())
      .then((data: Seller[]) => setSellers(data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold">Sellers</h2>
      <ul>
        {sellers.map((s) => (
          <li key={s.id}>
            {s.name || "Unnamed Seller"} ({s.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
