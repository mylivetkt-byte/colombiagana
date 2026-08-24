import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRaffleStore } from '@/store/raffleStore';
import { MessageCircle, X, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  buyer_name: string;
  buyer_email: string;
  sender: 'buyer' | 'admin';
  message: string;
  created_at: string;
}

export function ChatWidget() {
  const { config } = useRaffleStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!email) return;
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('buyer_email', email)
      .order('created_at', { ascending: true });
    setMessages((data as ChatMessage[]) || []);
  };

  useEffect(() => {
    if (open && email) {
      load();
      const t = setInterval(load, 5000);
      return () => clearInterval(t);
    }
  }, [open, email]);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  const startChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) load();
  };

  const send = async () => {
    if (!message.trim() || !name.trim() || !email.trim()) return;
    const { error } = await supabase.from('chat_messages').insert({
      raffle_id: config.id,
      buyer_name: name.trim(),
      buyer_email: email.trim(),
      sender: 'buyer',
      message: message.trim(),
    });
    if (!error) {
      setMessage('');
      load();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full gold-gradient text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Abrir chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[28rem] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="gold-gradient text-primary-foreground px-4 py-3 font-semibold flex items-center justify-between">
            <span>Chat con el administrador</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar chat">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!email ? (
            <form onSubmit={startChat} className="p-4 space-y-3 flex-1 flex flex-col justify-center">
              <p className="text-sm text-muted-foreground">
                Déjanos tu nombre y correo para chatear con el administrador.
              </p>
              <input
                required
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
              />
              <input
                required
                type="email"
                placeholder="Tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="gold-gradient text-primary-foreground rounded-lg py-2 text-sm font-semibold hover:opacity-90"
              >
                Iniciar chat
              </button>
            </form>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center mt-6">
                    Escribe tu primer mensaje.
                  </p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      m.sender === 'buyer'
                        ? 'bg-primary text-primary-foreground ml-auto rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}
                  >
                    {m.message}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') send();
                  }}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={send}
                  className="gold-gradient text-primary-foreground rounded-lg px-3 flex items-center justify-center hover:opacity-90"
                  aria-label="Enviar"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
