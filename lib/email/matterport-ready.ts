import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface MatterportReadyParams {
  to: string
  clientName: string
  address: string
  tourLink: string
  panelLink: string
}

export async function sendMatterportReady({
  to,
  clientName,
  address,
  tourLink,
  panelLink,
}: MatterportReadyParams) {
  const firstName = clientName.split(" ")[0]

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your 3D Tour is Ready</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#09090b;padding:32px 40px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Propus</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.4px;">
                Your 3D tour is ready 🏠
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                Hi ${firstName}, your Matterport 3D scan is now live and ready to view.
              </p>

              <!-- Property block -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:10px;border:1px solid #e4e4e7;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.8px;">Property</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#09090b;">${address}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="border-radius:10px;background:#09090b;">
                    <a href="${tourLink}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.2px;">
                      View in your panel →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:14px;color:#52525b;line-height:1.6;">
                Please review the tour and let us know if you have any questions.
              </p>

              <!-- Secondary link -->
              <p style="margin:0;font-size:13px;color:#a1a1aa;">
                Or open the 3D tour directly: <a href="${panelLink}" style="color:#09090b;text-decoration:underline;">Open Matterport Tour</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f4f4f5;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                You are receiving this email because you booked a Matterport 3D scan with Propus.<br/>
                © ${new Date().getFullYear()} Propus. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return resend.emails.send({
    from: "Propus <onboarding@resend.dev>",
    to,
    subject: `Your 3D tour is ready — ${address}`,
    html,
  })
}
