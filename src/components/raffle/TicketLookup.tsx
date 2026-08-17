import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/format";

type Result = {
  id: string;
  buyer_name: string;
  quantity: number;
  total_price: number;
  payment_status: string;
  created_at: string;
  ticket_numbers: string[] | null;
};

const statusLabel: Record<string, string> = {
  pending: "Pendiente de verificación",
  verified: "Confirmado",
  cancelled: "Cancelado",
};

export const TicketLookup = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 5) {
      toast.error("Ingresa tu correo o teléfono completo");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("lookup-tickets", {
        body: { query: query.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults(data.results ?? []);
    } catch (err) {
      toast.error("No pudimos consultar tus números. Intenta de nuevo.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="consulta" className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2">Consulta tus números</h2>
        <p className="text-center text-muted-foreground mb-8">
          Escribe el correo o teléfono con el que compraste.
        </p>

        <form onSubmit={search} className="flex flex-col sm:flex-row gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="correo@ejemplo.com o 3001234567"
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Consultar
          </Button>
        </form>

        {results && results.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">
            No encontramos compras con esos datos.
          </p>
        )}

        <div className="space-y-4 mt-8">
          {results?.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold">{r.buyer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.quantity} número(s) · {formatMoney(r.total_price)}
                  </p>
                </div>
                <Badge variant={r.payment_status === "verified" ? "default" : "secondary"}>
                  {statusLabel[r.payment_status] ?? r.payment_status}
                </Badge>
              </div>
              {r.ticket_numbers ? (
                <div className="flex flex-wrap gap-2">
                  {r.ticket_numbers.map((n) => (
                    <span
                      key={n}
                      className="px-3 py-1 rounded-md bg-primary/10 text-primary font-mono font-bold"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tus números se revelarán cuando el administrador verifique tu pago.
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
