import { Home, Heart, ShoppingCart, User, Settings } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  role: 'admin' | 'customer';
}

export function BottomNav({ currentPage, onNavigate, role }: BottomNavProps) {
  const customerNavItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'favorites', icon: Heart, label: 'Favorit' },
    { id: 'cart', icon: ShoppingCart, label: 'Keranjang' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  const adminNavItems = [
    { id: 'admin', icon: Settings, label: 'Kelola Menu' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  const navItems = role === 'admin' ? adminNavItems : customerNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-amber-600' : 'text-gray-500'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
