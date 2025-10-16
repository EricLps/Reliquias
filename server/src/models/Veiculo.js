import mongoose from 'mongoose';

const VeiculoSchema = new mongoose.Schema({
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  ano: { type: Number, required: true },
  preco: { type: Number, required: true },
  cor: { type: String },
  km: { type: Number },
  imagens: [{
    fileId: { type: String }, // GridFS file id
    url: { type: String }, // opcional, caso sirva via rota
    principal: { type: Boolean, default: false }
  }],
}, { timestamps: true });

export default mongoose.model('Veiculo', VeiculoSchema);
