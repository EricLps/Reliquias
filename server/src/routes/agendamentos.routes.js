import { Router } from 'express';
import Agendamento from '../models/Agendamento.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const ag = await Agendamento.create(req.body);
    res.status(201).json(ag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

router.get('/', verifyToken, requireAdmin, async (_req, res) => {
  const lista = await Agendamento.find().sort({ createdAt: -1 });
  res.json(lista);
});

export default router;
 
// Atualizar status do agendamento
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    const allowed = ['pendente', 'confirmado', 'cancelado'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Status inválido' });
    const ag = await Agendamento.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!ag) return res.status(404).json({ error: 'Não encontrado' });
    res.json(ag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});
