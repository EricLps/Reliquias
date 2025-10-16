import { Router } from 'express';
import Lead from '../models/Lead.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar lead' });
  }
});

router.get('/', verifyToken, requireAdmin, async (_req, res) => {
  const lista = await Lead.find().sort({ createdAt: -1 });
  res.json(lista);
});

export default router;
