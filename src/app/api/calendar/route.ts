import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exchangeRefreshToken } from "@/lib/google";
import { google } from "googleapis";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const seller = await (prisma as any).seller.findUnique({ where: { userId: session.user.id } });
    if (!seller?.encryptedRefresh) {
      return NextResponse.json({ error: "Not connected" }, { status: 404 });
    }
    const accessToken = await exchangeRefreshToken(seller.encryptedRefresh);
    const oauth2 = new google.auth.OAuth2();
    oauth2.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2 });
    const res = await calendar.events.list({
      calendarId: "primary",
      singleEvents: true,
      orderBy: "startTime",
      timeMin: new Date().toISOString(),
      maxResults: 10,
    });
    return NextResponse.json({ events: res.data.items ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Calendar error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  // TODO: Add Google Calendar event creation
  return NextResponse.json({ message: "Calendar event created (stub)", body });
}
