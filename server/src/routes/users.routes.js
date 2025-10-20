import { Router } from 'express';
import User from '../models/User.js';
import { verifyToken, requireAdmin, requireAdminMaster } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

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

// Bootstrapping endpoint (opcional): permitir que um admin crie um adminMaster uma única vez, se não existir.
// Mantém simples para facilitar o onboard. Pode ser removido depois.
router.post('/admin-master', verifyToken, requireAdmin, async (req, res) => {
  try {
    const exists = await User.findOne({ role: 'adminMaster' }).lean();
    if (exists) return res.status(400).json({ error: 'Já existe um adminMaster' });
    const { nome, email, senha } = req.body || {};
    if (!nome || !email || !senha) return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
    const senhaHash = bcrypt.hashSync(senha, 10);
    const user = await User.create({ nome, email: email.toLowerCase(), senhaHash, role: 'adminMaster' });
    res.status(201).json({ _id: user._id, nome: user.nome, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar adminMaster' });
  }
});

// Criar usuário comum (apenas adminMaster)
router.post('/', verifyToken, requireAdminMaster, async (req, res) => {
  try {
    const { nome, email, senha } = req.body || {};
    if (!nome || !email || !senha) return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
    const exists = await User.findOne({ email: email.toLowerCase() }).lean();
    if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });
    const senhaHash = bcrypt.hashSync(senha, 10);
    const user = await User.create({ nome, email: email.toLowerCase(), senhaHash, role: 'user' });
    res.status(201).json({ _id: user._id, nome: user.nome, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});
