import { useState, useEffect } from 'react';
import { Header } from './Header';
import { CoffeeCard } from './CoffeeCard';
import { Search } from 'lucide-react';

interface HomePageProps {
  coffees: any[];
  favorites: Set<string>;
  branches: any[];
  selectedBranch: string;
  onBranchChange: (branchId: string) => void;
  onToggleFavorite: (coffeeId: string) => void;
  onAddToCart: (coffeeId: string) => void;
  onCoffeeClick: (coffeeId: string) => void;
}

export function HomePage({
  coffees,
  favorites,
  branches,
  selectedBranch,
  onBranchChange,
  onToggleFavorite,
  onAddToCart,
  onCoffeeClick,
}: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(coffees.map((c) => c.category))];

  const filteredCoffees = coffees.filter((coffee) => {
    const matchesSearch = coffee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coffee.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || coffee.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-20">
      <Header
        title="MyBKOP"
        showBranchSelector
        selectedBranch={selectedBranch}
        branches={branches}
        onBranchChange={onBranchChange}
      />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kopi favorit..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Coffee Grid */}
        {filteredCoffees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada menu yang ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoffees.map((coffee) => (
              <CoffeeCard
                key={coffee.id}
                coffee={coffee}
                isFavorite={favorites.has(coffee.id)}
                onToggleFavorite={() => onToggleFavorite(coffee.id)}
                onAddToCart={() => onAddToCart(coffee.id)}
                onClick={() => onCoffeeClick(coffee.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
