import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRaffleStore } from "@/store/raffleStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Trophy, Gift, DollarSign, Ticket } from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

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

  const { config, soldNumbers, specialPrizes, loadSpecialPrizes } = useRaffleStore();

  useEffect(() => {
    loadSpecialPrizes();
  }, []);

  const totalNumbers = config.endNumber - config.startNumber + 1;
  const soldPercentage = totalNumbers > 0 ? (soldNumbers.length / totalNumbers) * 100 : 0;

  // Mapa rápido: número -> premio (todos los premios con número asignado)
  const prizeMap = new Map(
    specialPrizes.filter(p => p.ticketNumber !== null).map(p => [String(p.ticketNumber), p])
  );

  // Revelación secuencial: los premios se van desbloqueando de a uno a medida
  // que avanza la venta, desde el 30% hasta el 70%.
  // Ejemplo con 10 premios: 30%, 34%, 38%, 42%, 46%, 50%, 54%, 58%, 62%, 66%
  const sortedPrizes = specialPrizes
    .filter(p => p.ticketNumber !== null)
    .sort((a, b) => a.ticketNumber! - b.ticketNumber!);
  
  const getPrizeUnlockThreshold = (ticketNumber: number) => {
    const index = sortedPrizes.findIndex(p => p.ticketNumber === ticketNumber);
    if (index === -1) return 100;
    const total = sortedPrizes.length;
    const step = total > 1 ? 40 / (total - 1) : 0;
    return 30 + index * step;
  };

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

        <div className="space-y-6 mt-8">
          {results?.map((r) => {
            // Buscar números premiados entre los boletos de esta compra
            const winnerTickets = r.ticket_numbers
              ? r.ticket_numbers.filter(n => {
                  const prize = prizeMap.get(n);
                  if (!prize) return false;
                  return soldPercentage >= getPrizeUnlockThreshold(prize.ticketNumber);
                })
              : [];

            return (
              <Card key={r.id} className={cn("p-5 overflow-hidden", winnerTickets.length > 0 && "border-primary/40")}>
                {/* Header de la compra */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
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

                {/* Boletas normales (sin premio) */}
                {r.ticket_numbers ? (
                  <div className="flex flex-wrap gap-2">
                    {r.ticket_numbers.map((n) => {
                      const prize = prizeMap.get(n);
                      const isUnlocked = prize
                        ? soldPercentage >= getPrizeUnlockThreshold(prize.ticketNumber)
                        : false;
                      if (prize && isUnlocked) return null; // Los ganadores se renderizan abajo
                      return (
                        <span
                          key={n}
                          className="px-3 py-1 rounded-md bg-primary/10 text-primary font-mono font-bold"
                        >
                          {n}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tus números se revelarán cuando el administrador verifique tu pago.
                  </p>
                )}

                {/* Boletas GANADORAS — diseño especial de boleto */}
                {winnerTickets.length > 0 && (
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-2 text-primary text-sm font-bold animate-pulse">
                      <Trophy className="w-4 h-4" />
                      ¡Tienes {winnerTickets.length > 1 ? `${winnerTickets.length} números premiados` : "un número premiado"}!
                    </div>

                    {winnerTickets.map((n) => {
                      const prize = prizeMap.get(n)!;
                      return (
                        <div key={n} className="relative rounded-2xl overflow-hidden shadow-xl flex animate-fade-in">
                          {/* Glow animado */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 pointer-events-none" />

                          {/* Stub izquierdo del boleto */}
                          <div className="relative z-10 w-28 bg-muted/30 border-r border-dashed border-border flex flex-col items-center justify-center p-3 shrink-0">
                            <div className="absolute -top-3 right-[-13px] w-6 h-6 rounded-full bg-background border border-border" />
                            <div className="absolute -bottom-3 right-[-13px] w-6 h-6 rounded-full bg-background border border-border" />
                            <Ticket className="w-5 h-5 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Nro.</span>
                            <span className="font-display font-extrabold text-2xl gold-text leading-none">
                              {n}
                            </span>
                          </div>

                          {/* Contenido derecho */}
                          <div className="relative z-10 flex-1 p-4 bg-background flex flex-col justify-center gap-1">
                            <div className="flex items-center gap-2">
                              {prize.prizeType === "money" ? (
                                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-accent/15 text-accent">
                                  <DollarSign className="w-3 h-3" /> Efectivo
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-primary/15 text-primary">
                                  <Gift className="w-3 h-3" /> Artículo
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-base">{prize.prizeDescription}</p>
                            {prize.prizeType === "money" && prize.prizeAmount && (
                              <p className="text-sm text-muted-foreground font-semibold">
                                {formatMoney(prize.prizeAmount)} {config.currency}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              El administrador se pondrá en contacto contigo para entregar el premio. 🎉
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
