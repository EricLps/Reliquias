import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();

// Admin simulado
const ADMIN_EMAIL = 'admin@reliquias.com';
const ADMIN_PASS_HASH = bcrypt.hashSync('admin123', 8);

function handleLogin(req, res) {
  const { email, senha } = req.body || {};
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  if (email.toLowerCase() === ADMIN_EMAIL && bcrypt.compareSync(senha, ADMIN_PASS_HASH)) {
    const token = jwt.sign({ sub: 'admin', role: 'admin', email: ADMIN_EMAIL }, process.env.JWT_SECRET || 'dev', { expiresIn: '8h' });
    return res.json({ token, user: { email: ADMIN_EMAIL, role: 'admin', nome: 'Administrador' } });
  }
  return res.status(401).json({ error: 'Credenciais inválidas' });
}

// Endpoints equivalentes para contornar bloqueios de extensões de navegador
router.post('/login', handleLogin);
router.post('/signin', handleLogin);

export default router;
