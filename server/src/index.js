import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import multer from 'multer';

import authRoutes from './routes/auth.routes.js';
import veiculosRoutes from './routes/veiculos.routes.js';
import leadsRoutes from './routes/leads.routes.js';
import agendamentosRoutes from './routes/agendamentos.routes.js';

const app = express();

app.use(helmet());
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : '*';

const corsOptions = {
  origin: (origin, callback) => {
  // Aceita requisições sem Origin (curl) e origem 'null' (file://)
    if (!origin || origin === 'null') return callback(null, true);

  // Localhost/127.0.0.1 em qualquer porta (dev)
  const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/i.test(origin || '');
    if (isLocalDev) return callback(null, true);

  // Domínios *.vercel.app (deploys e previews)
  const isVercel = /^https?:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(origin || '');
  if (isVercel) return callback(null, true);

    if (allowedOrigins === '*' || (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin))) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
  credentials: false
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/reliquias';
mongoose.connect(mongoUri).then(() => {
  console.log('MongoDB conectado');
}).catch(err => {
  console.error('Erro ao conectar no MongoDB:', err);
  process.exit(1);
});

// Rotas
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/veiculos', veiculosRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/agendamentos', agendamentosRoutes);

// Start
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API ouvindo em http://localhost:${port}`));

// Error handler (inclui erros de upload do Multer)
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Arquivo muito grande. Limite: 20MB por imagem.' });
    }
    return res.status(400).json({ error: 'Erro no upload de arquivo', details: err.message });
  }
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor', details: err?.message });
});
