import Navbar from "@/components/Navbar";
import SellerList from "@/components/SellerList";

export default async function BuyerDashboardPage() {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-5xl p-4 grid gap-6">
        <h1 className="text-2xl font-semibold">Buyer dashboard</h1>
        <p className="text-sm text-gray-600">Search sellers and book appointments.</p>
        <SellerList />
      </main>
    </div>
  );
}


