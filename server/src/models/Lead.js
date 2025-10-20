import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  telefone: { type: String },
  mensagem: { type: String },
  interesseTestDrive: { type: Boolean, default: false },
  dataHora: { type: Date },
  origem: { type: String, enum: ['contato', 'veiculo', 'outro'], default: 'contato' },
  status: { type: String, enum: ['aberto', 'concluido'], default: 'aberto' },
  agendamentoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agendamento' }
}, { timestamps: true });

export default mongoose.model('Lead', LeadSchema);
