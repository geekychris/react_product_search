const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

// Configuration
const PORT = process.env.PORT || 4000;
const TARGET = process.env.OPENSEARCH_URL || 'http://localhost:30920';

const app = express();

// Dynamic CORS to support localhost and LAN IP
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://192.168.1.145:3000',
  'http://192.168.1.145:3001',
]);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser clients
    if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization,X-Requested-With,Content-Length',
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Health check
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Proxy any request under /api to OpenSearch
app.use(
  '/api',
  createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    ws: true,
    secure: false,
    xfwd: true,
    pathRewrite: {
      '^/api': '',
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err.message);
      res.status(502).send('Proxy error');
    },
    onProxyReq: (proxyReq) => {
      // Ensure JSON requests are correctly forwarded
      if (!proxyReq.getHeader('content-type')) {
        proxyReq.setHeader('content-type', 'application/json');
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Mirror the request origin if it's allowed
      const origin = req.headers.origin;
      if (origin && ALLOWED_ORIGINS.has(origin)) {
        proxyRes.headers['Access-Control-Allow-Origin'] = origin;
        proxyRes.headers['Vary'] = 'Origin';
      }
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'OPTIONS,HEAD,GET,POST,PUT,DELETE';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,Content-Type,Content-Length,Authorization';
    },
    logLevel: 'debug',
  })
);

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
  console.log(`Forwarding /api -> ${TARGET}`);
});

