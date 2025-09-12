"use client";
import { useEffect, useState } from "react";

export default function SellerList() {
  const [sellers, setSellers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sellers")
      .then((res) => res.json())
      .then((data) => setSellers(data));
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
