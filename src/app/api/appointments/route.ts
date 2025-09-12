import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { exchangeRefreshToken, insertEvent } from "@/lib/google";
import { getServerAuthSession } from "@/lib/auth";

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    include: { buyer: true, seller: true },
  });
  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { sellerId, buyerId, start, end, summary } = body as {
    sellerId: string;
    buyerId?: string;
    start: string;
    end: string;
    summary?: string;
  };
  if (!sellerId || !start || !end) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const effectiveBuyerId = buyerId && buyerId !== "self" ? buyerId : session.user.id;

  const [seller, buyer] = await Promise.all([
    prisma.user.findUnique({ where: { id: sellerId }, include: { accounts: true } }),
    prisma.user.findUnique({ where: { id: effectiveBuyerId }, include: { accounts: true } }),
  ]);
  if (!seller || !buyer) return NextResponse.json({ error: "Invalid users" }, { status: 400 });

  // Exchange refresh token for seller (if stored)
  const sellerRecord = await (prisma as any).seller.findUnique({ where: { userId: seller.id } });
  let sellerAccess: string | null = null;
  if (sellerRecord?.encryptedRefresh) {
    try {
      sellerAccess = await exchangeRefreshToken(sellerRecord.encryptedRefresh);
    } catch (e: any) {
      return NextResponse.json({ error: `Seller token exchange failed: ${e?.message ?? e}` }, { status: 500 });
    }
  }

  // Use buyer access if available from session provider account
  const buyerAccess = buyer.accounts?.find(a => a.provider === 'google')?.access_token ?? null;

  const startIso = new Date(start).toISOString();
  const endIso = new Date(end).toISOString();

  let eventSellerId: string | undefined;
  let eventBuyerId: string | undefined;
  const attendees = [seller.email, buyer.email].filter(Boolean) as string[];
  try {
    if (sellerAccess) {
      const ev = await insertEvent(sellerAccess, { calendarId: 'primary', summary: summary ?? 'Meeting', start: startIso, end: endIso, attendees, createConference: true });
      eventSellerId = ev.id ?? undefined;
    }
  } catch (e: any) {
    return NextResponse.json({ error: `Seller event create failed: ${e?.message ?? e}` }, { status: 500 });
  }
  try {
    if (buyerAccess) {
      const ev = await insertEvent(buyerAccess, { calendarId: 'primary', summary: summary ?? 'Meeting', start: startIso, end: endIso, attendees, createConference: true });
      eventBuyerId = ev.id ?? undefined;
    }
  } catch (e: any) {
    // Do not fail the whole booking if buyer calendar fails; continue
  }

  const created = await prisma.appointment.create({
    data: {
      sellerId,
      buyerId: effectiveBuyerId,
      start: new Date(startIso),
      end: new Date(endIso),
      eventIdSeller: eventSellerId,
      eventIdBuyer: eventBuyerId,
    } as any,
  });

  return NextResponse.json(created, { status: 201 });
}
