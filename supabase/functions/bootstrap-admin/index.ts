import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { email, password } = await req.json();
  if (!email || !password) return new Response(JSON.stringify({ error: "missing" }), { status: 400 });

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

  const { error: roleError } = await admin
    .from("user_roles")
    .insert({ user_id: data.user!.id, role: "admin" });

  return new Response(
    JSON.stringify({ ok: !roleError, user_id: data.user!.id, roleError: roleError?.message }),
    { headers: { "Content-Type": "application/json" } },
  );
});
