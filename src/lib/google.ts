import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { decryptString } from "@/lib/crypto";

function getOAuthClient(): OAuth2Client {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : undefined
  );
  return client;
}

export function getCalendarClient(accessToken: string) {
  const oauth2 = getOAuthClient();
  oauth2.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth: oauth2 });
}

export type CalendarEventInput = {
  calendarId: string;
  summary: string;
  description?: string;
  start: string; // ISO
  end: string; // ISO
  attendees?: string[];
  createConference?: boolean;
};

export async function insertEvent(token: string, input: CalendarEventInput) {
  const calendar = getCalendarClient(token);
  const res = await calendar.events.insert({
    calendarId: input.calendarId,
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.start },
      end: { dateTime: input.end },
      attendees: input.attendees?.map((e) => ({ email: e })),
      conferenceData: input.createConference
        ? { createRequest: { requestId: `req-${Date.now()}` } }
        : undefined,
    },
    conferenceDataVersion: input.createConference ? 1 : 0,
  });
  return res.data;
}

export async function exchangeRefreshToken(encryptedRefresh: string) {
  const refresh = decryptString(encryptedRefresh);
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: refresh });
  const res = await client.getAccessToken();
  const token = res?.token ?? (res as unknown as { credentials?: { access_token?: string } })?.credentials?.access_token;
  if (!token) throw new Error("No access token returned (check refresh token and scopes)");
  return token;
}

export async function getFreeBusy(accessToken: string, timeMin: string, timeMax: string) {
  const calendar = getCalendarClient(accessToken);
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: "primary" }],
    },
  });
  return res.data.calendars?.primary?.busy ?? [];
}

export async function exchangeRawRefreshToken(refresh: string) {
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: refresh });
  const res = await client.getAccessToken();
  const token = res?.token ?? (res as unknown as { credentials?: { access_token?: string } })?.credentials?.access_token;
  if (!token) throw new Error("No access token returned");
  return token;
}


