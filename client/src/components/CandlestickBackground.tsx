import { useEffect, useRef, useState } from 'react';

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  isUp: boolean;
}

interface CandlestickProps {
  className?: string;
}

const CandlestickBackground = ({ className = '' }: CandlestickProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Generate initial candlestick data with upward trend
    const generateCandlestickData = (count: number): Candle[] => {
      const data: Candle[] = [];
      let price = 50 + Math.random() * 10; // Start around middle of chart
      
      for (let i = 0; i < count; i++) {
        // More likely to go up than down (upward trend)
        const isUp = Math.random() > 0.4;
        const changePercent = Math.random() * 2; // Max 2% change
        
        const open = price;
        
        if (isUp) {
          // For uptrend, tend to close higher than open
          price = price * (1 + changePercent / 100);
        } else {
          // Still can go down sometimes, but less overall
          price = price * (1 - changePercent / 100);
        }
        
        const close = price;
        
        // Generate high and low prices
        const high = Math.max(open, close) * (1 + Math.random() * 0.5 / 100);
        const low = Math.min(open, close) * (1 - Math.random() * 0.5 / 100);
        
        data.push({ open, high, low, close, isUp });
      }
      
      return data;
    };
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Initialize data first
    const candlesticks: Candle[] = generateCandlestickData(30);
    let animationFrame: number = 0;
    let offset = 0;
    
    setIsInitialized(true);
    
    // Set canvas to be full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    function drawCandlestickChart() {
      if (!ctx || !canvas) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set transparency - reduced to avoid text disruption
      ctx.globalAlpha = 0.12;
      
      const candleWidth = canvas.width / 12; // Increased candle width for better visibility
      const spacing = candleWidth * 0.25; 
      const totalCandleWidth = candleWidth + spacing;
      
      // Calculate chart height and scaling
      const chartHeight = canvas.height * 0.7;
      const chartTop = canvas.height * 0.15;
      
      // Find min and max values for scaling
      let minPrice = Math.min(...candlesticks.map(c => c.low));
      let maxPrice = Math.max(...candlesticks.map(c => c.high));
      const range = maxPrice - minPrice;
      
      // Add padding to min/max for better visualization
      minPrice -= range * 0.1;
      maxPrice += range * 0.1;
      
      // Scale function to convert price to y-coordinate
      const scaleY = (price: number) => {
        return chartTop + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
      };
      
      // Draw candlesticks with animation
      for (let i = 0; i < candlesticks.length; i++) {
        const candle = candlesticks[i];
        const x = ((i * totalCandleWidth) - offset) % (canvas.width + totalCandleWidth * 2) - totalCandleWidth;
        
        if (x < -totalCandleWidth || x > canvas.width) continue;
        
        // Draw wick
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, scaleY(candle.high));
        ctx.lineTo(x + candleWidth / 2, scaleY(candle.low));
        ctx.strokeStyle = candle.isUp ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 2; // Reduced line width
        ctx.stroke();
        
        // Draw body
        const openY = scaleY(candle.open);
        const closeY = scaleY(candle.close);
        const bodyHeight = Math.abs(closeY - openY);
        const bodyY = Math.min(openY, closeY);
        
        // Reduced visibility of candlesticks to avoid text disruption
        if (candle.isUp) {
          // Removed glow effect and reduced opacity
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        }
        
        ctx.fillRect(x, bodyY, candleWidth, bodyHeight);
        
        // Reset shadow for performance
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      
      // Move the chart
      offset += 0.3; // Speed of movement
      
      // Reset offset when a full candlestick moves out of view
      if (offset > totalCandleWidth) {
        offset = 0;
        
        // Add a new candlestick when cycle completes
        const lastCandle = candlesticks[candlesticks.length - 1];
        let newPrice = lastCandle.close;
        
        // Continue the trend (more likely to go up)
        const isUp = Math.random() > 0.4;
        const changePercent = Math.random() * 2;
        
        if (isUp) {
          newPrice = newPrice * (1 + changePercent / 100);
        } else {
          newPrice = newPrice * (1 - changePercent / 100);
        }
        
        const open = lastCandle.close;
        const close = newPrice;
        const high = Math.max(open, close) * (1 + Math.random() * 0.5 / 100);
        const low = Math.min(open, close) * (1 - Math.random() * 0.5 / 100);
        
        // Remove first candlestick and add new one
        candlesticks.shift();
        candlesticks.push({ open, high, low, close, isUp });
      }
      
      animationFrame = requestAnimationFrame(drawCandlestickChart);
    }
    
    // Start animation after initialization
    drawCandlestickChart();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
    />
  );
};

export default CandlestickBackground;