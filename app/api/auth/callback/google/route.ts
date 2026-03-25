import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "No code in callback" }, { status: 400 })
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: "http://localhost:3000/api/auth/callback/google",
      grant_type: "authorization_code",
    }),
  })

  const tokens = await res.json()

  return NextResponse.json({
    message: "✅ Copy the refresh_token below into your .env.local as GOOGLE_REFRESH_TOKEN",
    refresh_token: tokens.refresh_token ?? "❌ NOT RETURNED — make sure you set prompt=consent",
    access_token: tokens.access_token,
  })
}
