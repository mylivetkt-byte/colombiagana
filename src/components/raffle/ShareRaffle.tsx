import { Button } from '@/components/ui/button';
import { Share2, MessageCircle, Facebook, Link2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareRaffleProps {
  title: string;
}

export function ShareRaffle({ title }: ShareRaffleProps) {
  const url = typeof window !== 'undefined' ? window.location.origin : '';
  const text = `¡Participa en ${title}! Compra tus boletas aquí:`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    toast.success('Enlace copiado');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        /* cancelado por el usuario */
      }
    } else {
      copy();
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button variant="outline" size="sm" className="gap-2" onClick={nativeShare}>
        <Share2 className="w-4 h-4" /> Compartir
      </Button>
      <Button variant="outline" size="sm" className="gap-2" asChild>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
      </Button>
      <Button variant="outline" size="sm" className="gap-2" asChild>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Facebook className="w-4 h-4" /> Facebook
        </a>
      </Button>
      <Button variant="outline" size="sm" className="gap-2" onClick={copy}>
        <Link2 className="w-4 h-4" /> Copiar enlace
      </Button>
    </div>
  );
}
