import { useEffect, useRef, useState } from 'react';

interface LiveCandleTeaserProps {
  pair: string;
}

export function LiveCandleTeaser({ pair }: LiveCandleTeaserProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // we'll use parent size
  const animationFrameRef = useRef<number | null>(null);
  const [prices, setPrices] = useState<number[]>([]);

  // Initialize prices
  useEffect(() => {
    const initial: number[] = [];
    let current = 100 + Math.random() * 10; // tighter range for small space
    for (let i = 0; i < 20; i++) {          // fewer candles = cleaner in h-16
      initial.push(current);
      current += (Math.random() - 0.5) * 0.8;
    }
    setPrices(initial);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Animation
  useEffect(() => {
    if (prices.length === 0) return;

    let lastTick = performance.now();

    const animate = (now: number) => {
      if (now - lastTick > 1200 + Math.random() * 800) {
        setPrices(prev => {
          const last = prev[prev.length - 1];
          const next = last + (Math.random() - 0.5) * 0.9;
          return [...prev.slice(-19), next];
        });
        lastTick = now;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current!);
  }, [prices.length]);

  // Draw with ultra-strict bounds
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to EXACT parent size every render
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Clip aggressively inside
    ctx.save();
    ctx.beginPath();
    ctx.rect(1, 1, w - 2, h - 2); // inset 1px on all sides
    ctx.clip();

    if (prices.length < 2) return;

    const candleCount = prices.length;
    const candleWidth = Math.max(2, w / candleCount * 0.55); // very narrow
    const gap = (w / candleCount) - candleWidth;

    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;

    // Heavy vertical padding for tiny container
    const vPad = h * 0.28; // ~28% top + bottom = 56% reserved → plenty of space
    const usableH = h - vPad * 2;

    const scaleY = (val: number) =>
      vPad + usableH - ((val - minP) / range) * usableH;

    prices.forEach((close, i) => {
      if (i === 0) return;
      const prev = prices[i - 1];

      const x = i * (candleWidth + gap) + gap / 2;
      const y1 = scaleY(prev);
      const y2 = scaleY(close);

      const isUp = close >= prev;
      const bodyColor = isUp ? '#10b981' : '#ef4444';
      const wickColor = isUp ? '#34d399' : '#f87171';

      // Wick – short & centered
      const midX = x + candleWidth / 2;
      ctx.beginPath();
      ctx.moveTo(midX, Math.min(y1, y2));
      ctx.lineTo(midX, Math.max(y1, y2));
      ctx.lineWidth = 1;
      ctx.strokeStyle = wickColor;
      ctx.stroke();

      // Body – small rectangle
      ctx.fillStyle = bodyColor;
      ctx.fillRect(x, Math.min(y1, y2), candleWidth, Math.abs(y1 - y2) || 1);
    });

    ctx.restore();
  }, [prices]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block"
      style={{
        display: 'block',
        imageRendering: 'crisp-edges',
        backfaceVisibility: 'hidden',
      }}
    />
  );
}