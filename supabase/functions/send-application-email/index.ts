// Diraflow — send-application-email
// Supabase Edge Function (Deno runtime)
//
// Triggered by the careers page after a successful insert into the applications table.
// Sends two emails via Resend:
//   1. Confirmation to the candidate
//   2. Internal notification to the recruitment team
//
// Required environment variable (set in Supabase Dashboard > Edge Functions > Secrets):
//   RESEND_API_KEY   — your Resend API key  (https://resend.com/api-keys)
//   RECRUITMENT_EMAIL — the inbox that receives internal notifications
//                       e.g. recruitment@diraflowai.com
//   SITE_URL          — e.g. https://diraflowai.com  (used for the "review link" in the internal email)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_URL = "https://api.resend.com/emails";

// ── helpers ────────────────────────────────────────────────────────────────────

function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

async function sendEmail(payload: {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
}) {
  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error (${res.status}): ${err}`);
  }
  return res.json();
}

// ── email templates ────────────────────────────────────────────────────────────

function candidateEmailHtml(name: string, position: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0f0f0f;padding:28px 40px;">
              <p style="margin:0;color:#c8922a;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">Diraflow AI</p>
              <p style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:700;line-height:1.3;">Assessment Received</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;color:#333333;font-size:15px;line-height:1.65;">
              <p style="margin:0 0 16px;">Hello ${name},</p>
              <p style="margin:0 0 16px;">Thank you for completing your assessment for the <strong>${position}</strong> role.</p>
              <p style="margin:0 0 16px;">We have successfully received your application and assessment responses. Our team will manually review your submission and evaluate your results.</p>
              <p style="margin:0 0 16px;">We will communicate the outcome and next steps once the review process is complete.</p>
              <p style="margin:0 0 8px;">Thank you for your interest in joining Diraflow.</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #eeeeee;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#111111;">Diraflow Recruitment Team</p>
              <p style="margin:0;font-size:13px;color:#888888;">Training data for frontier AI &nbsp;·&nbsp; <a href="https://diraflowai.com" style="color:#c8922a;text-decoration:none;">diraflowai.com</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function internalEmailHtml(args: {
  name: string;
  email: string;
  position: string;
  submittedAt: string;
  siteUrl: string;
}): string {
  const { name, email, position, submittedAt, siteUrl } = args;
  const reviewUrl = `${siteUrl}/admin/applications`;
  const date = new Date(submittedAt).toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  });
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0f0f0f;padding:28px 40px;">
              <p style="margin:0;color:#c8922a;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">Internal — Diraflow Recruitment</p>
              <p style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:700;line-height:1.3;">New Application Received</p>
            </td>
          </tr>

          <!-- Details table -->
          <tr>
            <td style="padding:36px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;color:#333333;line-height:1.6;">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#888888;width:40%;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Candidate</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-weight:600;">${name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#888888;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Email</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><a href="mailto:${email}" style="color:#c8922a;text-decoration:none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#888888;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Position</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">${position}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#888888;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Submitted</td>
                  <td style="padding:8px 0;">${date}</td>
                </tr>
              </table>

              <div style="margin-top:28px;">
                <a href="${reviewUrl}"
                   style="display:inline-block;background:#c8922a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
                  Review application →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 24px;font-size:12px;color:#aaaaaa;">
              This is an automated notification from the Diraflow careers platform.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── main handler ───────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  // Validate required env vars early so errors are obvious
  const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
  const RECRUITMENT_EMAIL = Deno.env.get("RECRUITMENT_EMAIL");
  const SITE_URL = Deno.env.get("SITE_URL") ?? "https://diraflowai.com";

  if (!RESEND_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY secret is not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
  if (!RECRUITMENT_EMAIL) {
    return new Response(JSON.stringify({ error: "RECRUITMENT_EMAIL secret is not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  let body: { full_name?: string; email?: string; position?: string; submitted_at?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  const { full_name, email, position, submitted_at } = body;
  if (!full_name || !email || !position) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: full_name, email, position" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders() } }
    );
  }

  const FROM_ADDRESS = "Diraflow Recruitment <careers@diraflowai.com>";

  try {
    // 1. Candidate confirmation
    await sendEmail({
      from: FROM_ADDRESS,
      to: email,
      subject: `Assessment Received — Diraflow Application`,
      html: candidateEmailHtml(full_name, position),
    });

    // 2. Internal recruitment notification
    await sendEmail({
      from: FROM_ADDRESS,
      to: RECRUITMENT_EMAIL,
      subject: `New application: ${full_name} — ${position}`,
      html: internalEmailHtml({
        name: full_name,
        email,
        position,
        submittedAt: submitted_at ?? new Date().toISOString(),
        siteUrl: SITE_URL,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  } catch (err) {
    console.error("Email send error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
});