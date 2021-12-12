import mongoose from 'mongoose';

const PeididoSchema = new mongoose.Schema({
  pedido: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Cliente',
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Usuario',
  },
  estado: {
    type: String,
    default: "PENDIENTE",
  },
},
  {
    timestamps: true,
  });

export default mongoose.model('Pedido', PeididoSchema);