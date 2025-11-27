import { useState } from 'react';
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CoffeeDetailProps {
  coffee: any;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: (quantity: number) => void;
  onBack: () => void;
}

export function CoffeeDetail({
  coffee,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onBack,
}: CoffeeDetailProps) {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    onAddToCart(quantity);
    setQuantity(1);
  };

  if (!coffee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="relative">
        <ImageWithFallback
          src={coffee.image}
          alt={coffee.name}
          className="w-full h-80 object-cover"
        />
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Favorite Button */}
        <button
          onClick={onToggleFavorite}
          className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg"
        >
          <Heart
            className={`w-6 h-6 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Category Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-amber-600 text-white px-4 py-2 rounded-full">
            {coffee.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <h1 className="text-3xl mb-2">{coffee.name}</h1>
        <p className="text-2xl text-amber-600 mb-6">
          Rp {coffee.price.toLocaleString('id-ID')}
        </p>

        <div className="mb-8">
          <h2 className="text-xl mb-3">Deskripsi</h2>
          <p className="text-gray-600 leading-relaxed">{coffee.description}</p>
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <h2 className="text-xl mb-3">Jumlah</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDecrease}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-xl w-12 text-center">{quantity}</span>
            <button
              onClick={handleIncrease}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Harga</p>
            <p className="text-xl text-amber-600">
              Rp {(coffee.price * quantity).toLocaleString('id-ID')}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
