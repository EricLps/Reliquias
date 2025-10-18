import mongoose from 'mongoose';

const AgendamentoSchema = new mongoose.Schema({
  // Dados do contato
  nome: { type: String },
  email: { type: String },
  telefone: { type: String },
  // Informações do agendamento/evento
  titulo: { type: String },
  tipo: { type: String, enum: ['test-drive', 'vistoria', 'evento', 'outro'], default: 'outro' },
  prioridade: { type: String, enum: ['azul', 'amarelo', 'vermelho'], default: 'azul' },
  notas: { type: String },
  // Relacionamento opcional com veículo
  veiculoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Veiculo' },
  dataHora: { type: Date, required: true },
  status: { type: String, enum: ['pendente', 'confirmado', 'cancelado'], default: 'pendente' },
  origem: { type: String, enum: ['publico', 'admin'], default: 'publico' }
}, { timestamps: true });

export default mongoose.model('Agendamento', AgendamentoSchema);
