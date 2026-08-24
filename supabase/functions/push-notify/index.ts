import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const { purchaseId } = await req.json().catch(() => ({}));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY") || "";
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY") || "";
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@colombiaga.com";

    if (!vapidPrivate) {
      return new Response(
        JSON.stringify({ error: "VAPID no configurado" }),
        { status: 500, headers: { "Content-Type": "application/json", ...cors } }
      );
    }

    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    let buyerName = "nueva compra";
    let quantity = 0;
    if (purchaseId) {
      const { data: p } = await supabase
        .from("ticket_purchases")
        .select("buyer_name, quantity")
        .eq("id", purchaseId)
        .single();
      if (p) {
        buyerName = p.buyer_name;
        quantity = p.quantity;
      }
    }

    const payload = JSON.stringify({
      title: "Nueva boleta por verificar",
      body: `Compra de ${buyerName} (${quantity} boleta(s)) pendiente de verificación`,
      url: "/admin/purchases",
      tag: "new-purchase",
    });

    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("subscription");

    if (error || !subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...cors } }
      );
    }

    let sent = 0;
    for (const row of subs) {
      try {
        await webpush.sendNotification(row.subscription, payload);
        sent++;
      } catch (e) {
        console.error("push send error:", e?.message || e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent }),
      { status: 200, headers: { "Content-Type": "application/json", ...cors } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json", ...cors } }
    );
  }
});
