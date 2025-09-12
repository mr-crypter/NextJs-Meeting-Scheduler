import Navbar from "@/components/Navbar";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import RoleSelect from "@/components/RoleSelect";

export default async function RolePage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl p-6 grid gap-6">
        <h1 className="text-2xl font-semibold">Choose your role</h1>
        <p className="text-gray-600">Select whether you want to use the app as a Seller or a Buyer. You can change this later.</p>
        <RoleSelect />
      </main>
    </div>
  );
}
