import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = await req.json().catch(() => ({}));
    const raw = typeof body?.query === "string" ? body.query.trim() : "";
    if (raw.length < 5 || raw.length > 120) {
      return json({ error: "Ingresa tu correo o teléfono completo." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const isEmail = raw.includes("@");
    const value = isEmail ? raw.toLowerCase() : raw.replace(/[^\d]/g, "");
    if (!isEmail && value.length < 7) {
      return json({ error: "Número de teléfono inválido." }, 400);
    }

    const column = isEmail ? "buyer_email" : "buyer_phone";
    const { data, error } = await supabase
      .from("ticket_purchases")
      .select("id, buyer_name, ticket_numbers, quantity, total_price, payment_status, created_at")
      .ilike(column, isEmail ? value : `%${value}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const results = (data ?? []).map((p) => ({
      id: p.id,
      buyer_name: p.buyer_name,
      quantity: p.quantity,
      total_price: p.total_price,
      payment_status: p.payment_status,
      created_at: p.created_at,
      ticket_numbers: p.payment_status === "confirmed" ? p.ticket_numbers : null,
    }));

    return json({ results });
  } catch (e) {
    console.error("lookup-tickets error", e);
    return json({ error: "Error consultando los tickets." }, 500);
  }
});
