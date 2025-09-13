import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exchangeRefreshToken } from "@/lib/google";
import { google } from "googleapis";

export async function GET(req: Request) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
    let accessToken: string | null = null;
    if (seller?.encryptedRefresh) {
      accessToken = await exchangeRefreshToken(seller.encryptedRefresh);
    } else {
      // Fallback: use the current Google account access_token from the linked account if present
      const account = await prisma.account.findFirst({ where: { userId: session.user.id, provider: "google" } });
      accessToken = account?.access_token ?? null;
    }
    if (!accessToken) return NextResponse.json({ error: "Not connected" }, { status: 404 });
    const { searchParams } = new URL(req.url);
    const timeMin = searchParams.get("timeMin") ?? new Date().toISOString();
    const timeMax = searchParams.get("timeMax") ?? undefined;
    const oauth2 = new google.auth.OAuth2();
    oauth2.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2 });
    const res = await calendar.events.list({
      calendarId: "primary",
      singleEvents: true,
      orderBy: "startTime",
      timeMin,
      timeMax,
      maxResults: 2500,
    });
    return NextResponse.json({ events: res.data.items ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Calendar error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  // TODO: Add Google Calendar event creation
  return NextResponse.json({ message: "Calendar event created (stub)", body });
}
