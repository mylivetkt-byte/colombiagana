import { serve } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { purchaseId } = await req.json().catch(() => ({}));

    if (!purchaseId) {
      return new Response(
        JSON.stringify({ error: "purchaseId is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = serve(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: purchase, error } = await supabase
      .from("ticket_purchases")
      .select("*, raffle_config:raffle_id (*)")
      .eq("id", purchaseId)
      .single();

    if (error || !purchase) {
      return new Response(
        JSON.stringify({ error: "Purchase not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const raffle = purchase.raffle_config as any;
    const ticketNumbers = purchase.ticket_numbers
      .map((n: number) => String(n))
      .join(", ");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Tus números de rifa</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f6f6f6; font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td align="center" style="padding:24px 0;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
                  <tr>
                    <td style="background: linear-gradient(90deg, #d4af37, #fcd34d); padding:20px 24px; text-align:center;">
                      <h1 style="margin:0; font-size:22px; color:#111827;">Colombia Gana</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px;">
                      <h2 style="margin:0 0 12px; font-size:18px; color:#111827;">¡Felicidades! Tu pago ha sido verificado</h2>
                      <p style="margin:0 0 12px; font-size:14px; color:#374151;">Hola <strong>${purchase.buyer_name}</strong>,</p>
                      <p style="margin:0 0 12px; font-size:14px; color:#374151;">Tus números para la rifa <strong>${raffle?.title ?? "Colombia Gana"}</strong> son:</p>
                      <p style="margin:16px 0; font-size:20px; font-weight:bold; letter-spacing:1px; color:#d4af37;">${ticketNumbers}</p>
                      <p style="margin:0 0 8px; font-size:14px; color:#374151;">Cantidad: <strong>${purchase.quantity}</strong></p>
                      <p style="margin:0 0 8px; font-size:14px; color:#374151;">Total pagado: <strong>${purchase.total_price}</strong></p>
                      <p style="margin:16px 0 0; font-size:12px; color:#6b7280;">Guarda este correo como comprobante. ¡Mucha suerte!</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "ColombiaGana <noreply@tudominio.com>",
        to: [purchase.buyer_email],
        subject: `¡Tus números de rifa! ${raffle?.title ?? "Colombia Gana"}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Resend error:", text);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("send-ticket-email error", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
