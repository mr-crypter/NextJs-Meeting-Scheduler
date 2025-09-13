import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeRefreshToken, getFreeBusy } from "@/lib/google";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sellerId } = await params;
  const { searchParams } = new URL(req.url);
  const timeMin = searchParams.get('timeMin') ?? new Date().toISOString();
  const timeMax = searchParams.get('timeMax') ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const seller = await prisma.seller.findUnique({ where: { userId: sellerId } });
  if (!seller?.encryptedRefresh) return NextResponse.json({ busy: [] });

  try {
    const access = await exchangeRefreshToken(seller.encryptedRefresh);
    const busy = await getFreeBusy(access, timeMin, timeMax);
    return NextResponse.json({ busy });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "token exchange failed";
    return NextResponse.json({ busy: [], error: message }, { status: 200 });
  }
}


