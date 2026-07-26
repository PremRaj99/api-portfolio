import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Enable CORS for frontend client
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
  })
);

app.options('*', cors());

app.use(express.json());

// API Health Check
app.get('/api/health', (e, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Prem Raj Portfolio Serverless API',
  });
});

// Routes Configuration
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Standalone local execution server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const server = app
    .listen(PORT, () => {
      console.log(`🚀 Portfolio Serverless API server listening on http://localhost:${PORT}`);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = Number(PORT) + 1;
        console.warn(`⚠️ Port ${PORT} is currently in use. Starting API server on fallback port ${nextPort}...`);
        app.listen(nextPort, () => {
          console.log(`🚀 Portfolio Serverless API server listening on http://localhost:${nextPort}`);
        });
      } else {
        console.error('Server listen error:', err);
      }
    });
}

// Export default app for Vercel Serverless Functions deployment
export default app;
