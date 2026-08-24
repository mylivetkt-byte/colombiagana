import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { purchaseId } = await req.json().catch(() => ({}));
    console.log("send-ticket-email request", { purchaseId });

    if (!purchaseId) {
      return new Response(
        JSON.stringify({ error: "purchaseId is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase env vars" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: purchase, error } = await supabase
      .from("ticket_purchases")
      .select("*, raffle_config:raffle_id (*)")
      .eq("id", purchaseId)
      .single();

    const raffle = (purchase?.raffle_config as any);

    console.log("send-ticket-email purchase lookup", {
      found: !!purchase,
      error: error ? error.message : null,
      buyerEmail: purchase?.buyer_email || null,
      raffle: raffle?.title,
    });

    if (error || !purchase) {
      return new Response(
        JSON.stringify({ error: "Purchase not found", detail: error?.message }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Solo se envían los números cuando el pago está verificado
    if (purchase.payment_status !== "verified") {
      return new Response(
        JSON.stringify({ error: "El pago aún no está verificado" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // API key de Brevo: variable de entorno o configuración guardada en raffle_config
    let brevoApiKey = Deno.env.get("BREVO_API_KEY") || "";
    if (!brevoApiKey && raffle?.brevo_api_key) brevoApiKey = raffle.brevo_api_key;

    const senderEmail = raffle?.brevo_sender_email || "noreply@colombiaga.com";
    const senderName = raffle?.brevo_sender_name || "Colombia Gana";

    if (!brevoApiKey) {
      return new Response(
        JSON.stringify({ error: "BREVO_API_KEY no configurada. Agrégala en Configuración." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const digitCount = String(raffle?.end_number ?? 9999).length;
    const ticketNumbers = Array.isArray(purchase.ticket_numbers)
      ? purchase.ticket_numbers.map((n: number) => String(n).padStart(digitCount, "0")).join(", ")
      : "";

    const eventName = raffle?.title || "Colombia Gana";

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
                <p style="margin:0 0 12px; font-size:14px; color:#374151;">Tus números para la rifa <strong>${eventName}</strong> son:</p>
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

    const brevoPayload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: purchase.buyer_email, name: purchase.buyer_name }],
      subject: `¡Tus números de rifa! ${eventName}`,
      htmlContent: emailHtml,
    };

    console.log("send-ticket-email sending to Brevo", {
      to: purchase.buyer_email,
      subject: brevoPayload.subject,
      from: `${senderName} <${senderEmail}>`,
    });

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(brevoPayload),
    });

    const responseText = await response.text();
    console.log("send-ticket-email brevo response", {
      status: response.status,
      body: responseText,
    });

    if (!response.ok) {
      console.error("send-ticket-email failed", { status: response.status, body: responseText });
      await supabase
        .from("ticket_purchases")
        .update({ email_error: `Brevo ${response.status}: ${responseText}` })
        .eq("id", purchaseId);
      return new Response(
        JSON.stringify({ error: "Failed to send email", detail: responseText }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    await supabase
      .from("ticket_purchases")
      .update({ email_sent_at: new Date().toISOString(), email_error: null })
      .eq("id", purchaseId);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("send-ticket-email error", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
