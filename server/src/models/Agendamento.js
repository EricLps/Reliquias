import mongoose from 'mongoose';

const AgendamentoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  telefone: { type: String },
  veiculoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Veiculo' },
  dataHora: { type: Date, required: true },
  status: { type: String, enum: ['pendente', 'confirmado', 'cancelado'], default: 'pendente' }
}, { timestamps: true });

export default mongoose.model('Agendamento', AgendamentoSchema);
