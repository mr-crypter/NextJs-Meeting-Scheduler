import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET() {
  const sellers = await prisma.user.findMany({
    where: { role: 'SELLER' },
    select: { id: true, name: true, email: true, image: true }
  });
  return NextResponse.json(sellers);
}
