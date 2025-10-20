import { Router } from 'express';
import User from '../models/User.js';
import { verifyToken, requireAdmin, requireAdminMaster } from '../middleware/auth.js';

const router = Router();

// Listar usuários (acesso: admin e adminMaster)
router.get('/', verifyToken, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find({}, { senhaHash: 0 }).sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Atualizar role (somente adminMaster)
router.patch('/:id/role', verifyToken, requireAdminMaster, async (req, res) => {
  try {
    const { role } = req.body || {};
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role inválida' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, projection: { senhaHash: 0 } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

export default router;
