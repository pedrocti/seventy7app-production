import WebSocket from 'ws';
import fetch from 'node-fetch';

type MarketData = {
  btc?: { price: number; change: number };
  eth?: { price: number; change: number };
  sol?: { price: number; change: number };
  xrp?: { price: number; change: number };

  gbpusd?: { price: number };
  eurusd?: { price: number };
  usdjpy?: { price: number };
  xau?: { price: number };
};

class MarketService {
  private ws: WebSocket | null = null;
  private clients: Set<WebSocket> = new Set();
  private prices: MarketData = {};

  start() {
    this.connectCrypto();
    this.startForexPolling();
  }

  /* =========================
     CRYPTO (BINANCE WS)
  ========================= */
  private connectCrypto() {
    console.log('[Market] Connecting to Binance...');

    this.ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');

    this.ws.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());

        parsed.forEach((item: any) => {
          const symbol = item.s;
          const price = parseFloat(item.c);
          const change = parseFloat(item.P);

          if (symbol === 'BTCUSDT') this.prices.btc = { price, change };
          if (symbol === 'ETHUSDT') this.prices.eth = { price, change };
          if (symbol === 'SOLUSDT') this.prices.sol = { price, change };
          if (symbol === 'XRPUSDT') this.prices.xrp = { price, change };
        });

        this.broadcast();
      } catch (err) {
        console.error('[Crypto Parse Error]', err);
      }
    });

    this.ws.on('close', () => {
      console.log('[Market] Reconnecting Binance...');
      setTimeout(() => this.connectCrypto(), 3000);
    });
  }

  /* =========================
     FOREX + GOLD (POLLING)
  ========================= */
  private startForexPolling() {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();

        if (data.result === 'success') {
          const rates = data.rates;

          if (rates.GBP) this.prices.gbpusd = { price: 1 / rates.GBP };
          if (rates.EUR) this.prices.eurusd = { price: 1 / rates.EUR };
          if (rates.JPY) this.prices.usdjpy = { price: rates.JPY };
        }
      } catch (err) {
        console.error('[Forex Error]', err);
      }

      try {
        const goldRes = await fetch('https://api.metals.live/v1/spot/gold');
        const goldData = await goldRes.json();

        if (goldData?.price) {
          this.prices.xau = { price: goldData.price };
        }
      } catch (err) {
        console.error('[Gold Error]', err);
      }

      this.broadcast();
    };

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

    client.send(JSON.stringify(this.prices));
  }

  private broadcast() {
    const payload = JSON.stringify(this.prices);

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
}

export const marketService = new MarketService();