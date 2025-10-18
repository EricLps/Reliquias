import { Router } from 'express';
import Agendamento from '../models/Agendamento.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Público cria (contato/agendamento vindo do site)
router.post('/', async (req, res) => {
  try {
    const payload = { ...req.body, origem: 'publico' };
    const ag = await Agendamento.create(payload);
    res.status(201).json(ag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

// Admin cria manualmente um evento/agendamento (ex.: vistoria, compromisso, etc)
router.post('/admin', verifyToken, requireAdmin, async (req, res) => {
  try {
    const payload = { ...req.body, origem: 'admin' };
    const ag = await Agendamento.create(payload);
    res.status(201).json(ag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar agendamento (admin)' });
  }
});

router.get('/', verifyToken, requireAdmin, async (_req, res) => {
  // Ordena por data futura mais próxima; depois por prioridade e criação
  const lista = await Agendamento.find().sort({ dataHora: 1, prioridade: 1, createdAt: 1 });
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

// Atualização geral (admin): editar dados do agendamento/evento
router.patch('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const fields = ['nome','email','telefone','titulo','tipo','prioridade','notas','veiculoId','dataHora','status'];
    const updates = {};
    for (const f of fields) if (req.body[f] !== undefined) updates[f] = req.body[f];
    const ag = await Agendamento.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!ag) return res.status(404).json({ error: 'Não encontrado' });
    res.json(ag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});
