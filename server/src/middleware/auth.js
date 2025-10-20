import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  try {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token ausente' });
    }
    const token = auth.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
  if (req.user.role !== 'admin' && req.user.role !== 'adminMaster') return res.status(403).json({ error: 'Acesso negado' });
  next();
}

export function requireAdminMaster(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
  if (req.user.role !== 'adminMaster') return res.status(403).json({ error: 'Acesso negado' });
  next();
}
