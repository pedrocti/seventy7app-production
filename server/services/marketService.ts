// server/services/marketService.ts
import WebSocket from 'ws';
import fetch from 'node-fetch';

type MarketData = {
  btc?:    { price: number; change: number };
  eth?:    { price: number; change: number };
  sol?:    { price: number; change: number };
  xrp?:    { price: number; change: number };
  gbpusd?: { price: number };
  eurusd?: { price: number };
  usdjpy?: { price: number };
  xau?:    { price: number };
};

class MarketService {
  private ws:           WebSocket | null = null;
  private clients:      Set<WebSocket>   = new Set();
  private prices:       MarketData       = {};
  private reconnecting: boolean          = false;
  private retryDelay:   number           = 30_000;   // starts at 30s
  private readonly MAX_DELAY             = 300_000;  // caps at 5min

  start() {
    this.connectCrypto();
    this.startForexPolling();
  }

  /* =========================
     CRYPTO (BINANCE WS)
     Uses a `reconnecting` flag so that when Binance responds with
     451, both `error` and `close` fire but only ONE reconnect timer
     is ever scheduled. Exponential backoff caps at 5 minutes.
  ========================= */
  private scheduleReconnect() {
    if (this.reconnecting) return;   // already scheduled — skip
    this.reconnecting = true;
    const delay = this.retryDelay;
    this.retryDelay = Math.min(this.retryDelay * 2, this.MAX_DELAY);
    console.log(`[Market] Binance unavailable — retrying in ${delay / 1000}s`);
    setTimeout(() => {
      this.reconnecting = false;
      this.connectCrypto();
    }, delay);
  }

  private connectCrypto() {
    try {
      this.ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');

      this.ws.on('error', (err: Error) => {
        console.warn('[Market] WebSocket error (non-fatal):', err.message);
        this.ws = null;
        this.scheduleReconnect();
      });

      this.ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          parsed.forEach((item: any) => {
            const symbol = item.s;
            const price  = parseFloat(item.c);
            const change = parseFloat(item.P);
            if (symbol === 'BTCUSDT') this.prices.btc = { price, change };
            if (symbol === 'ETHUSDT') this.prices.eth = { price, change };
            if (symbol === 'SOLUSDT') this.prices.sol = { price, change };
            if (symbol === 'XRPUSDT') this.prices.xrp = { price, change };
          });
          // Reset backoff on successful data
          this.retryDelay = 30_000;
          this.broadcast();
        } catch (err) {
          console.error('[Market] Crypto parse error:', err);
        }
      });

      this.ws.on('close', () => {
        this.ws = null;
        this.scheduleReconnect();
      });

    } catch (err) {
      console.warn('[Market] Failed to create WebSocket (non-fatal):', err);
      this.scheduleReconnect();
    }
  }

  /* =========================
     FOREX + GOLD (POLLING)
     Both APIs are wrapped in separate try/catch so one
     failing does not prevent the other from running.
  ========================= */
  private startForexPolling() {
    const fetchRates = async () => {

      // Forex rates via open.er-api.com (free, no key)
      try {
        const res  = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json() as any;

        if (data.result === 'success') {
          const rates = data.rates;
          if (rates.GBP) this.prices.gbpusd = { price: 1 / rates.GBP };
          if (rates.EUR) this.prices.eurusd = { price: 1 / rates.EUR };
          if (rates.JPY) this.prices.usdjpy = { price: rates.JPY };
        }
      } catch (err: any) {
        console.warn('[Market] Forex polling error (non-fatal):', err.message);
      }

      // Gold price via metals.live (free, no key)
      try {
        const goldRes  = await fetch('https://api.metals.live/v1/spot/gold');
        const goldData = await goldRes.json() as any;

        if (goldData?.price) {
          this.prices.xau = { price: goldData.price };
        }
      } catch (err: any) {
        console.warn('[Market] Gold polling error (non-fatal):', err.message);
      }

      this.broadcast();
    };

    // Run immediately then every 30 seconds
    fetchRates();
    setInterval(fetchRates, 30000);
  }

  /* =========================
     CLIENT HANDLING
  ========================= */
  addClient(client: WebSocket) {
    this.clients.add(client);

    client.on('close', () => {
      this.clients.delete(client);
    });

    // Send current prices immediately on connect
    try {
      client.send(JSON.stringify(this.prices));
    } catch {
      // Client may have already closed
    }
  }

  private broadcast() {
    const payload = JSON.stringify(this.prices);

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
        } catch {
          // Remove dead clients
          this.clients.delete(client);
        }
      }
    });
  }
}

export const marketService = new MarketService();