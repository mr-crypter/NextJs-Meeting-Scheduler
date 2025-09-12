import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, role } = (await req.json()) as { userId: string; role: "BUYER" | "SELLER" };
  if (!userId || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const updated = await prisma.user.update({ where: { id: userId }, data: { role } });
  return NextResponse.json({ ok: true, user: { id: updated.id, role: updated.role } });
}


