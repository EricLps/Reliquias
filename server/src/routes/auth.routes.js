import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Admin simulado (temporário)
const ADMIN_EMAIL = 'admin@reliquias.com';
const ADMIN_PASS_HASH = bcrypt.hashSync('admin123', 8);

async function handleLogin(req, res) {
  const { email, senha } = req.body || {};
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  // 1) Tenta admin hardcoded (fallback temporário)
  if (email.toLowerCase() === ADMIN_EMAIL && bcrypt.compareSync(senha, ADMIN_PASS_HASH)) {
    const token = jwt.sign({ sub: 'admin-hardcoded', role: 'admin', email: ADMIN_EMAIL }, process.env.JWT_SECRET || 'dev', { expiresIn: '8h' });
    return res.json({ token, user: { email: ADMIN_EMAIL, role: 'admin', nome: 'Administrador' } });
  }

  // 2) Tenta usuário no banco
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
    const ok = bcrypt.compareSync(senha, user.senhaHash);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });
    const token = jwt.sign({ sub: String(user._id), role: user.role, email: user.email }, process.env.JWT_SECRET || 'dev', { expiresIn: '8h' });
    return res.json({ token, user: { email: user.email, role: user.role, nome: user.nome, id: user._id } });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao autenticar' });
  }
}

// Endpoints equivalentes para contornar bloqueios de extensões de navegador
router.post('/login', handleLogin);
router.post('/signin', handleLogin);

// Troca de senha (somente usuários do banco)
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { senhaAtual, novaSenha } = req.body || {};
    if (!senhaAtual || !novaSenha) return res.status(400).json({ error: 'senhaAtual e novaSenha são obrigatórios' });
    // Admin hardcoded não pode trocar por aqui
    if (!userId || String(userId).startsWith('admin')) return res.status(400).json({ error: 'Somente usuários do banco podem trocar a senha' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    const ok = bcrypt.compareSync(senhaAtual, user.senhaHash);
    if (!ok) return res.status(400).json({ error: 'Senha atual inválida' });
    user.senhaHash = bcrypt.hashSync(novaSenha, 10);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao trocar senha' });
  }
});

// Atualizar perfil (nome) — somente usuários do banco
router.patch('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { nome } = req.body || {};
    if (!nome || String(nome).trim().length < 2) return res.status(400).json({ error: 'Nome inválido' });
    // Admin hardcoded não pode alterar
    if (!userId || String(userId).startsWith('admin')) return res.status(400).json({ error: 'Somente usuários do banco podem alterar o perfil' });
    const user = await User.findByIdAndUpdate(userId, { nome: String(nome).trim() }, { new: true, projection: { senhaHash: 0 } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

export default router;
