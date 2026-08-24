import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const headers = { "Content-Type": "application/json" };
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { subscription } = await req.json();
    if (!subscription || !subscription.endpoint) {
      return new Response(
        JSON.stringify({ error: "subscription requerida" }),
        { status: 400, headers }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase
      .from("push_subscriptions")
      .insert({ subscription });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers }
      );
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers }
    );
  }
});
