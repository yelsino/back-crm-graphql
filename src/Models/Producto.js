import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  existencia: {
    type: Number,
    required: true,
    trim: true,
  },
  precio: {
    type: Number,
    required: true,
    trim: true,
  }
},
  {
    timestamps: true,
  }
);

ProductSchema.index({ nombre: 'text' });

export default mongoose.model('Producto', ProductSchema);

