import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senhaHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'adminMaster'], default: 'user' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
