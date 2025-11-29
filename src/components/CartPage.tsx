import { Header } from './Header';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './picture/ImageWithFallback';

interface CartPageProps {
  cart: any[];
  onUpdateQuantity: (coffeeId: string, quantity: number) => void;
  onRemoveItem: (coffeeId: string) => void;
  onCheckout: () => void;
}

export function CartPage({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartPageProps) {
  const total = cart.reduce((sum, item) => sum + (item.coffee?.price || 0) * item.quantity, 0);

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <Header title="Keranjang Belanja" />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl text-gray-700 mb-2">Keranjang Kosong</h2>
            <p className="text-gray-500 text-center">
              Belum ada item di keranjang Anda.<br />
              Yuk, mulai pesan kopi favorit!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.coffeeId}
                className="bg-white rounded-lg shadow-sm p-4"
              >
                <div className="flex gap-4">
                  <ImageWithFallback
                    src={item.coffee?.image || ''}
                    alt={item.coffee?.name || ''}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="mb-1">{item.coffee?.name}</h3>
                        <p className="text-amber-600">
                          Rp {item.coffee?.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.coffeeId)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onUpdateQuantity(item.coffeeId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.coffeeId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Biaya Layanan</span>
                  <span>Rp 0</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span>Total</span>
                  <span className="text-amber-600">
                    Rp {total.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Lanjut ke Pembayaran
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
