import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { Readable } from 'stream';
import Veiculo from '../models/Veiculo.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Multer em memória para permitir compressão com Sharp (aumenta limite para 20MB por arquivo)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

async function uploadToGridFS(buffer, filename, contentType = 'image/webp') {
  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    Readable.from(buffer).pipe(uploadStream)
      .on('error', reject)
      .on('finish', (file) => resolve(file._id.toString()));
  });
}

// Criar veículo com upload e compressão de até 6 imagens
router.post('/', verifyToken, requireAdmin, upload.array('imagens', 6), async (req, res) => {
  try {
    const { marca, modelo, ano, preco, cor, km, principalFileId } = req.body;

    const imagens = [];
    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        const f = req.files[i];
        // Compressão: redimensiona para no máximo 1600px e converte para WEBP
        const compressed = await sharp(f.buffer)
          .rotate()
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        const fileId = await uploadToGridFS(compressed, `${Date.now()}-${f.originalname.replace(/\s+/g, '_')}.webp`, 'image/webp');
        imagens.push({ fileId, principal: i === 0 });
      }
    }
    // URLs opcionais
    if (req.body.imagemUrl) {
      const url = String(req.body.imagemUrl).trim();
      if (url) imagens.push({ url, principal: imagens.length === 0 });
    }
    if (req.body.imagensUrls) {
      let arr = [];
      try { arr = JSON.parse(req.body.imagensUrls); } catch { arr = String(req.body.imagensUrls).split(','); }
      (arr || []).map(u => String(u).trim()).filter(Boolean).forEach(u => {
        imagens.push({ url: u, principal: imagens.length === 0 && !imagens.some(i => i.principal) });
      });
    }

    const veiculo = await Veiculo.create({ marca, modelo, ano, preco, cor, km, imagens });
    res.status(201).json(veiculo);
  } catch (err) {
    console.error('Erro ao criar veículo:', err);
    res.status(500).json({ error: 'Erro ao criar veículo', details: err?.message });
  }
});

// Listar veículos
router.get('/', async (_req, res) => {
  const lista = await Veiculo.find().sort({ createdAt: -1 });
  res.json(lista);
});

// Obter veículo
router.get('/:id', async (req, res) => {
  const item = await Veiculo.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Não encontrado' });
  res.json(item);
});

// Atualizar veículo
router.put('/:id', verifyToken, requireAdmin, upload.array('imagens', 6), async (req, res) => {
  try {
    const { marca, modelo, ano, preco, cor, km, principalFileId, principalUrl } = req.body;
    let removeImages = [];
    let removeImageUrls = [];
    if (req.body.removeImages) {
      try {
        // Aceita JSON array como string ou CSV
        removeImages = JSON.parse(req.body.removeImages);
        if (!Array.isArray(removeImages)) removeImages = String(req.body.removeImages).split(',').map(s => s.trim()).filter(Boolean);
      } catch (_) {
        removeImages = String(req.body.removeImages).split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (req.body.removeImageUrls) {
      try {
        removeImageUrls = JSON.parse(req.body.removeImageUrls);
        if (!Array.isArray(removeImageUrls)) removeImageUrls = String(req.body.removeImageUrls).split(',').map(s => s.trim()).filter(Boolean);
      } catch (_) {
        removeImageUrls = String(req.body.removeImageUrls).split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const veiculo = await Veiculo.findById(req.params.id);
    if (!veiculo) return res.status(404).json({ error: 'Não encontrado' });

    // Atualiza campos básicos se fornecidos
    if (marca !== undefined) veiculo.marca = marca;
    if (modelo !== undefined) veiculo.modelo = modelo;
    if (ano !== undefined) veiculo.ano = ano;
    if (preco !== undefined) veiculo.preco = preco;
    if (cor !== undefined) veiculo.cor = cor;
    if (km !== undefined) veiculo.km = km;

    // Remoção de imagens
    if (removeImages.length) {
      const db = mongoose.connection.db;
      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
      for (const fid of removeImages) {
        try {
          const oid = new mongoose.Types.ObjectId(fid);
          await bucket.delete(oid);
        } catch (_) {/* ignora */}
      }
      veiculo.imagens = (veiculo.imagens || []).filter(img => !removeImages.includes(img.fileId));
    }
    // Remover imagens por URL
    if (removeImageUrls.length) {
      veiculo.imagens = (veiculo.imagens || []).filter(img => !removeImageUrls.includes(img.url));
    }

    // Novas imagens
    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        const f = req.files[i];
        const compressed = await sharp(f.buffer)
          .rotate()
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        const fileId = await uploadToGridFS(compressed, `${Date.now()}-${f.originalname.replace(/\s+/g, '_')}.webp`, 'image/webp');
        veiculo.imagens.push({ fileId, principal: false });
      }
      // Garantir uma principal
      if (!veiculo.imagens.some(img => img.principal) && veiculo.imagens.length) {
        veiculo.imagens[0].principal = true;
      }
    }

    // Adicionar novas imagens por URL
    if (req.body.addImageUrls) {
      let arr = [];
      try { arr = JSON.parse(req.body.addImageUrls); } catch { arr = String(req.body.addImageUrls).split(','); }
      (arr || []).map(u => String(u).trim()).filter(Boolean).forEach(u => {
        veiculo.imagens.push({ url: u, principal: false });
      });
      if (!veiculo.imagens.some(img => img.principal) && veiculo.imagens.length) {
        veiculo.imagens[0].principal = true;
      }
    }

    // Atualiza imagem principal se fornecida
    if (principalFileId) {
      (veiculo.imagens || []).forEach(img => { img.principal = (img.fileId === principalFileId); });
    }
    if (principalUrl) {
      (veiculo.imagens || []).forEach(img => { img.principal = (img.url === principalUrl); });
    }

    const salvo = await veiculo.save();
    res.json(salvo);
  } catch (err) {
    console.error('Erro ao atualizar veículo:', err);
    res.status(500).json({ error: 'Erro ao atualizar', details: err?.message });
  }
});

// Excluir veículo
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const apagado = await Veiculo.findByIdAndDelete(req.params.id);
    if (!apagado) return res.status(404).json({ error: 'Não encontrado' });
    // Apagar imagens no GridFS
    try {
      const db = mongoose.connection.db;
      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
      for (const img of (apagado.imagens || [])) {
        if (!img.fileId) continue;
        try {
          const fileId = new mongoose.Types.ObjectId(img.fileId);
          await bucket.delete(fileId);
        } catch (_) {
          // Ignora ids inválidos
        }
      }
    } catch (e) {
      console.warn('Falha ao remover algumas imagens do GridFS:', e?.message);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir' });
  }
});

// Servir arquivo do GridFS (imagem)
router.get('/imagem/:fileId', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    res.set('Content-Type', 'image/webp');
    bucket.openDownloadStream(fileId).on('error', () => res.sendStatus(404)).pipe(res);
  } catch (err) {
    res.sendStatus(404);
  }
});

export default router;
