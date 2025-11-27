import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { HomePage } from './components/HomePage';
import { CoffeeDetail } from './components/CoffeeDetail';
import { FavoritesPage } from './components/FavoritesPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { ProfilePage } from './components/ProfilePage';
import { AdminManageMenu } from './components/AdminManageMenu';
import { BottomNav } from './components/BottomNav';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { toast, Toaster } from 'sonner@2.0.3';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-75c29e11`;

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [user, setUser] = useState<any>(null);

  // Page state
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCoffeeId, setSelectedCoffeeId] = useState('');

  // Data state
  const [coffees, setCoffees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch coffees
      const coffeesRes = await fetch(`${API_BASE}/coffees`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const coffeesData = await coffeesRes.json();
      setCoffees(coffeesData.coffees || []);

      // Fetch branches
      const branchesRes = await fetch(`${API_BASE}/branches`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const branchesData = await branchesRes.json();
      setBranches(branchesData.branches || []);

      // Fetch favorites
      const favRes = await fetch(`${API_BASE}/favorites`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const favData = await favRes.json();
      setFavorites(favData.favorites || []);

      // Fetch cart
      const cartRes = await fetch(`${API_BASE}/cart`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const cartData = await cartRes.json();
      setCart(cartData.cart || []);

      // Fetch profile
      const profileRes = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profileData = await profileRes.json();
      if (profileData.user) {
        setUser(profileData.user);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login gagal');
    }

    setAccessToken(data.accessToken);
    setUser(data.user);
    setIsAuthenticated(true);
    
    // Set current page based on role
    if (data.user.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('home');
    }
    
    toast.success('Berhasil login!');
  };

  const handleSignup = async (email: string, password: string, name: string, phone: string) => {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name, phone }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Pendaftaran gagal');
    }

    toast.success('Pendaftaran berhasil! Silakan login.');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessToken('');
    setUser(null);
    setCoffees([]);
    setFavorites([]);
    setCart([]);
    setCurrentPage('home');
    toast.success('Berhasil logout');
  };

  // Coffee handlers
  const handleToggleFavorite = async (coffeeId: string) => {
    const isFavorite = favorites.some((fav) => fav.coffeeId === coffeeId);

    try {
      if (isFavorite) {
        await fetch(`${API_BASE}/favorites/${coffeeId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setFavorites(favorites.filter((fav) => fav.coffeeId !== coffeeId));
        toast.success('Dihapus dari favorit');
      } else {
        const res = await fetch(`${API_BASE}/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ coffeeId }),
        });
        const data = await res.json();
        
        // Add coffee details to favorite
        const coffee = coffees.find((c) => c.id === coffeeId);
        setFavorites([...favorites, { ...data.favorite, coffee }]);
        toast.success('Ditambahkan ke favorit');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Gagal mengubah favorit');
    }
  };

  const handleAddToCart = async (coffeeId: string, quantity: number = 1) => {
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ coffeeId, quantity }),
      });
      const data = await res.json();

      // Update cart state
      const existingItem = cart.find((item) => item.coffeeId === coffeeId);
      const coffee = coffees.find((c) => c.id === coffeeId);
      
      if (existingItem) {
        setCart(
          cart.map((item) =>
            item.coffeeId === coffeeId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        );
      } else {
        setCart([...cart, { ...data.cartItem, coffee }]);
      }

      toast.success('Ditambahkan ke keranjang');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Gagal menambahkan ke keranjang');
    }
  };

  const handleUpdateCartQuantity = async (coffeeId: string, quantity: number) => {
    try {
      await fetch(`${API_BASE}/cart/${coffeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ quantity }),
      });

      setCart(
        cart.map((item) =>
          item.coffeeId === coffeeId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Gagal mengubah jumlah');
    }
  };

  const handleRemoveFromCart = async (coffeeId: string) => {
    try {
      await fetch(`${API_BASE}/cart/${coffeeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setCart(cart.filter((item) => item.coffeeId !== coffeeId));
      toast.success('Dihapus dari keranjang');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Gagal menghapus item');
    }
  };

  // Profile handlers
  const handleUpdateProfile = async (name: string, phone: string, branch: string) => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, phone, branch }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        toast.success('Profil berhasil diperbarui');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal memperbarui profil');
      throw error;
    }
  };

  const handleUploadPhoto = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch(`${API_BASE}/profile/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setUser({ ...user, photoUrl: data.photoUrl, photoSignedUrl: data.photoSignedUrl });
        toast.success('Foto profil berhasil diupload');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Gagal mengupload foto');
      throw error;
    }
  };

  // Order handler
  const handleSubmitOrder = async (paymentName: string, notes: string) => {
    try {
      const items = cart.map((item) => ({
        coffeeId: item.coffeeId,
        name: item.coffee.name,
        price: item.coffee.price,
        quantity: item.quantity,
      }));

      const total = cart.reduce((sum, item) => sum + item.coffee.price * item.quantity, 0);

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          items,
          total,
          paymentName,
          notes,
          branchId: user.branch,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCart([]);
        setCurrentPage('home');
        toast.success('Pesanan berhasil dibuat! Silakan ambil di cabang yang dipilih.');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Gagal membuat pesanan');
      throw error;
    }
  };

  // Admin handlers
  const handleAddCoffee = async (coffee: any) => {
    try {
      const res = await fetch(`${API_BASE}/coffees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(coffee),
      });
      const data = await res.json();

      if (res.ok) {
        setCoffees([...coffees, data.coffee]);
        toast.success('Menu berhasil ditambahkan');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error adding coffee:', error);
      toast.error('Gagal menambahkan menu');
      throw error;
    }
  };

  const handleUpdateCoffee = async (id: string, coffee: any) => {
    try {
      const res = await fetch(`${API_BASE}/coffees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(coffee),
      });
      const data = await res.json();

      if (res.ok) {
        setCoffees(coffees.map((c) => (c.id === id ? data.coffee : c)));
        toast.success('Menu berhasil diperbarui');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error updating coffee:', error);
      toast.error('Gagal memperbarui menu');
      throw error;
    }
  };

  const handleDeleteCoffee = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/coffees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        setCoffees(coffees.filter((c) => c.id !== id));
        toast.success('Menu berhasil dihapus');
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting coffee:', error);
      toast.error('Gagal menghapus menu');
      throw error;
    }
  };

  // Navigation handler
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedCoffeeId('');
  };

  const handleCoffeeClick = (coffeeId: string) => {
    setSelectedCoffeeId(coffeeId);
    setCurrentPage('detail');
  };

  const handleBranchChange = async (branchId: string) => {
    try {
      await handleUpdateProfile(user.name, user.phone, branchId);
    } catch (error) {
      console.error('Error updating branch:', error);
    }
  };

  // Render auth page
  if (!isAuthenticated) {
    return (
      <>
        <AuthPage onLogin={handleLogin} onSignup={handleSignup} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  const favoriteIds = new Set(favorites.map((fav) => fav.coffeeId));
  const selectedCoffee = coffees.find((c) => c.id === selectedCoffeeId);

  // Render pages
  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'home' && user?.role === 'customer' && (
        <HomePage
          coffees={coffees}
          favorites={favoriteIds}
          branches={branches}
          selectedBranch={user?.branch || ''}
          onBranchChange={handleBranchChange}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={(coffeeId) => handleAddToCart(coffeeId, 1)}
          onCoffeeClick={handleCoffeeClick}
        />
      )}

      {currentPage === 'detail' && selectedCoffee && (
        <CoffeeDetail
          coffee={selectedCoffee}
          isFavorite={favoriteIds.has(selectedCoffeeId)}
          onToggleFavorite={() => handleToggleFavorite(selectedCoffeeId)}
          onAddToCart={(quantity) => handleAddToCart(selectedCoffeeId, quantity)}
          onBack={() => handleNavigate('home')}
        />
      )}

      {currentPage === 'favorites' && (
        <FavoritesPage
          favorites={favorites}
          onRemoveFavorite={handleToggleFavorite}
          onAddToCart={(coffeeId) => handleAddToCart(coffeeId, 1)}
          onCoffeeClick={handleCoffeeClick}
        />
      )}

      {currentPage === 'cart' && (
        <CartPage
          cart={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={() => handleNavigate('checkout')}
        />
      )}

      {currentPage === 'checkout' && (
        <CheckoutPage
          cart={cart}
          branches={branches}
          selectedBranch={user?.branch || ''}
          onBranchChange={handleBranchChange}
          onBack={() => handleNavigate('cart')}
          onSubmitOrder={handleSubmitOrder}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          user={user}
          branches={branches}
          onUpdateProfile={handleUpdateProfile}
          onUploadPhoto={handleUploadPhoto}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'admin' && user?.role === 'admin' && (
        <AdminManageMenu
          coffees={coffees}
          onAddCoffee={handleAddCoffee}
          onUpdateCoffee={handleUpdateCoffee}
          onDeleteCoffee={handleDeleteCoffee}
        />
      )}

      {/* Bottom Navigation - only show on non-detail pages */}
      {currentPage !== 'detail' && currentPage !== 'checkout' && (
        <BottomNav
          currentPage={currentPage}
          onNavigate={handleNavigate}
          role={user?.role || 'customer'}
        />
      )}

      <Toaster position="top-center" richColors />
    </div>
  );
}
