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

// Atualização geral de campos do Lead (ex.: agendamentoId, mensagem...) (admin)
router.patch('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const allowed = ['nome','email','telefone','mensagem','interesseTestDrive','dataHora','origem','status','agendamentoId'];
    const updates = {};
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];
    const lead = await Lead.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!lead) return res.status(404).json({ error: 'Não encontrado' });
    res.json(lead);
  } catch (err) {
    console.error('Erro ao atualizar lead:', err);
    res.status(500).json({ error: 'Erro ao atualizar lead' });
  }
});

// Atualizar status do lead (aberto|concluido)
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    const allowed = ['aberto', 'concluido'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Status inválido' });
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!lead) return res.status(404).json({ error: 'Não encontrado' });
    res.json(lead);
  } catch (err) {
    console.error('Erro ao atualizar status do lead:', err);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Excluir lead
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const apagado = await Lead.findByIdAndDelete(req.params.id);
    if (!apagado) return res.status(404).json({ error: 'Não encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir lead:', err);
    res.status(500).json({ error: 'Erro ao excluir lead' });
  }
});

export default router;
