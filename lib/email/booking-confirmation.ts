import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const SERVICE_LABELS: Record<string, string> = {
  photos:     "Photography Shoot",
  matterport: "Matterport 3D Scan",
  both:       "Photography + Matterport 3D Scan",
}

interface BookingConfirmationParams {
  to: string
  clientName: string
  service: string
  date: string        // "2026-03-24"
  time: string        // "10:00"
  address: string
  panelLink: string   // invite or magic link
  isNewUser: boolean  // true = first booking → set-password CTA; false = returning client → no CTA
}

export async function sendBookingConfirmation({
  to,
  clientName,
  service,
  date,
  time,
  address,
  panelLink,
  isNewUser,
}: BookingConfirmationParams) {
  const serviceLabel = SERVICE_LABELS[service] ?? service
  const formattedDate = new Date(`${date}T${time}:00`).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed — Propus</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f0f0;padding:48px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;">

          <!-- Header -->
          <tr>
            <td style="background:#111111;padding:20px 40px;">
              <span style="color:#ffffff;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">PROPUS</span>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:48px 40px 40px;">
              <p style="margin:0 0 6px 0;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#999999;">Confirmation</p>
              <h1 style="margin:0 0 20px 0;font-size:30px;font-weight:300;color:#111111;line-height:1.15;letter-spacing:-.02em;">Booking Confirmed</h1>
              <p style="margin:0;font-size:15px;color:#555555;line-height:1.7;">Thank you, <strong style="color:#111111;font-weight:500;">${clientName}</strong>. We have received your booking and will be in touch shortly.</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 40px;"><div style="height:1px;background:#e4e4e4;"></div></td></tr>

          <!-- Details -->
          <tr>
            <td style="padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">

                <tr>
                  <td style="padding:20px 0;border-bottom:1px solid #e4e4e4;width:38%;vertical-align:top;">
                    <span style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#999999;">Service</span>
                  </td>
                  <td style="padding:20px 0 20px 16px;border-bottom:1px solid #e4e4e4;vertical-align:top;">
                    <span style="font-size:14px;color:#111111;line-height:1.5;">${serviceLabel}</span>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 0;border-bottom:1px solid #e4e4e4;width:38%;vertical-align:top;">
                    <span style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#999999;">Date &amp; Time</span>
                  </td>
                  <td style="padding:20px 0 20px 16px;border-bottom:1px solid #e4e4e4;vertical-align:top;">
                    <span style="font-size:14px;color:#111111;line-height:1.5;">${formattedDate}<br />${time}</span>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 0;width:38%;vertical-align:top;">
                    <span style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#999999;">Address</span>
                  </td>
                  <td style="padding:20px 0 20px 16px;vertical-align:top;">
                    <span style="font-size:14px;color:#111111;line-height:1.5;">${address}</span>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 40px;"><div style="height:1px;background:#e4e4e4;"></div></td></tr>

          <!-- CTA block -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${isNewUser ? `
              <p style="margin:0 0 24px 0;font-size:14px;color:#555555;line-height:1.7;">
                Track the progress of your booking in your personal client panel.
                Click below to set up your access — it takes less than a minute.
              </p>
              <a href="${panelLink}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:15px 32px;">
                Access My Panel &rarr;
              </a>
              <p style="margin:20px 0 0 0;font-size:12px;color:#aaaaaa;line-height:1.6;">
                This link is valid for 24 hours. After that, sign in at
                <a href="${appUrl}/login" style="color:#555555;text-decoration:underline;">${appUrl}/login</a>
              </p>
              ` : `
              <p style="margin:0;font-size:14px;color:#555555;line-height:1.7;">
                You can track your booking at any time by signing in to your client panel at
                <a href="${appUrl}/login" style="color:#111111;text-decoration:underline;">${appUrl}/login</a>.
              </p>
              `}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e4e4e4;background:#fafafa;">
              <p style="margin:0;font-size:11px;color:#aaaaaa;line-height:1.6;">
                &copy; Propus AG &nbsp;&middot;&nbsp; Z&uuml;rich, Switzerland
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Propus <onboarding@resend.dev>",
    to,
    subject: `Booking Confirmed – ${serviceLabel}`,
    html,
  })
}
