import { Heart, Plus } from 'lucide-react';
import { ImageWithFallback } from './picture/ImageWithFallback';

interface CoffeeCardProps {
  coffee: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
  };
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onAddToCart?: () => void;
  onClick?: () => void;
}

export function CoffeeCard({
  coffee,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onClick,
}: CoffeeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative cursor-pointer" onClick={onClick}>
        <ImageWithFallback
          src={coffee.image}
          alt={coffee.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>
        <div className="absolute top-2 left-2">
          <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm">
            {coffee.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg mb-1">{coffee.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{coffee.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-amber-600">
            Rp {coffee.price.toLocaleString('id-ID')}
          </span>
          
          {onAddToCart && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              className="bg-amber-600 text-white p-2 rounded-full hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
