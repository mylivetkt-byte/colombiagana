import { useEffect, useState } from 'react';

interface CountdownProps {
  date: string;
}

function diff(target: number) {
  const total = Math.max(0, target - Date.now());
  return {
    total,
    days: Math.floor(total / 86400000),
    hours: Math.floor((total / 3600000) % 24),
    minutes: Math.floor((total / 60000) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

export function Countdown({ date }: CountdownProps) {
  const target = new Date(`${date}T20:00:00`).getTime();
  const [time, setTime] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setTime(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!date || Number.isNaN(target)) return null;

  const items = [
    { value: time.days, label: 'Días' },
    { value: time.hours, label: 'Horas' },
    { value: time.minutes, label: 'Min' },
    { value: time.seconds, label: 'Seg' },
  ];

  return (
    <div className="mb-10">
      <div className="text-sm text-muted-foreground mb-3">
        {time.total > 0 ? 'Faltan para el sorteo' : 'El sorteo ya se realizó'}
      </div>
      <div className="flex justify-center gap-3">
        {items.map((item) => (
          <div key={item.label} className="glass-card px-4 py-3 min-w-[72px]">
            <div className="text-2xl md:text-3xl font-display gold-text">
              {String(item.value).padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
