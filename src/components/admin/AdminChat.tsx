import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  buyer_name: string;
  buyer_email: string;
  sender: 'buyer' | 'admin';
  message: string;
  created_at: string;
  is_read: boolean;
}

export function AdminChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    setMessages((data as ChatMessage[]) || []);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const conversations = (() => {
    const map = new Map<string, ChatMessage[]>();
    for (const m of messages) {
      if (!map.has(m.buyer_email)) map.set(m.buyer_email, []);
      map.get(m.buyer_email)!.push(m);
    }
    return Array.from(map.entries())
      .map(([email, msgs]) => ({
        email,
        name: msgs[0].buyer_name,
        msgs,
        last: msgs[msgs.length - 1],
        unread: msgs.filter((m) => m.sender === 'buyer' && !m.is_read).length,
      }))
      .sort(
        (a, b) =>
          new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime(),
      );
  })();

  const active = selected ? messages.filter((m) => m.buyer_email === selected) : [];

  const selectConversation = async (email: string) => {
    setSelected(email);
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('buyer_email', email)
      .eq('sender', 'buyer');
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    const conv = conversations.find((c) => c.email === selected);
    const { error } = await supabase.from('chat_messages').insert({
      buyer_name: conv?.name || '',
      buyer_email: selected,
      sender: 'admin',
      message: reply.trim(),
    });
    if (!error) {
      setReply('');
      load();
    }
  };

  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-4 h-[70vh]">
      <div className="glass-card overflow-hidden flex flex-col">
        <div className="p-3 border-b border-border font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Conversaciones
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">Sin mensajes.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.email}
              type="button"
              onClick={() => selectConversation(c.email)}
              className={`w-full text-left p-3 border-b border-border/50 hover:bg-muted/40 transition-colors ${
                selected === c.email ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">{c.name}</span>
                {c.unread > 0 && (
                  <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-2 shrink-0">
                    {c.unread}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">{c.last.message}</div>
              <div className="text-[10px] text-muted-foreground truncate">{c.email}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Selecciona una conversación
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
              {active.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    m.sender === 'admin'
                      ? 'bg-primary text-primary-foreground ml-auto rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {m.message}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendReply();
                }}
                placeholder="Responder..."
              />
              <Button onClick={sendReply} className="gold-gradient text-primary-foreground">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
