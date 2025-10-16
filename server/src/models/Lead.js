import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  telefone: { type: String },
  mensagem: { type: String },
  origem: { type: String, enum: ['contato', 'veiculo', 'outro'], default: 'contato' }
}, { timestamps: true });

export default mongoose.model('Lead', LeadSchema);
