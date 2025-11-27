import { Header } from './Header';
import { CoffeeCard } from './CoffeeCard';
import { Heart } from 'lucide-react';

interface FavoritesPageProps {
  favorites: any[];
  onRemoveFavorite: (coffeeId: string) => void;
  onAddToCart: (coffeeId: string) => void;
  onCoffeeClick: (coffeeId: string) => void;
}

export function FavoritesPage({
  favorites,
  onRemoveFavorite,
  onAddToCart,
  onCoffeeClick,
}: FavoritesPageProps) {
  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <Header title="Menu Favorit" />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl text-gray-700 mb-2">Belum Ada Favorit</h2>
            <p className="text-gray-500 text-center">
              Tambahkan menu kopi favorit Anda dengan<br />
              menekan tombol hati pada menu
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-6">
              {favorites.length} menu favorit
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <CoffeeCard
                  key={fav.coffeeId}
                  coffee={fav.coffee}
                  isFavorite={true}
                  onToggleFavorite={() => onRemoveFavorite(fav.coffeeId)}
                  onAddToCart={() => onAddToCart(fav.coffeeId)}
                  onClick={() => onCoffeeClick(fav.coffeeId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
