import { useState } from 'react';
import { Header } from './Header';
import { ArrowLeft, MapPin, CreditCard } from 'lucide-react';
import { ImageWithFallback } from './picture/ImageWithFallback';

interface CheckoutPageProps {
  cart: any[];
  branches: any[];
  selectedBranch: string;
  onBranchChange: (branchId: string) => void;
  onBack: () => void;
  onSubmitOrder: (paymentName: string, notes: string) => Promise<void>;
}

export function CheckoutPage({
  cart,
  branches,
  selectedBranch,
  onBranchChange,
  onBack,
  onSubmitOrder,
}: CheckoutPageProps) {
  const [paymentName, setPaymentName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.coffee?.price || 0) * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmitOrder(paymentName, notes);
    } finally {
      setLoading(false);
    }
  };

  const selectedBranchData = branches.find((b) => b.id === selectedBranch);

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <Header title="Pembayaran" />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Keranjang
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Branch Selection */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg">Lokasi Pengambilan</h2>
            </div>
            <select
              value={selectedBranch}
              onChange={(e) => onBranchChange(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} - {branch.address}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg">Informasi Pembayaran</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Atas Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={paymentName}
                  onChange={(e) => setPaymentName(e.target.value)}
                  required
                  placeholder="Nama pembeli"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Catatan untuk Toko (Opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Gula sedikit, tolong panaskan..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg mb-4">Ringkasan Pesanan</h2>
            
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.coffeeId} className="flex items-center gap-3">
                  <ImageWithFallback
                    src={item.coffee?.image || ''}
                    alt={item.coffee?.name || ''}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="mb-1">{item.coffee?.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x Rp {item.coffee?.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <p className="text-amber-600">
                    Rp {(item.coffee?.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Biaya Layanan</span>
                <span>Rp 0</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Total Pembayaran</span>
                <span className="text-xl text-amber-600">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-4 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Konfirmasi Pesanan'}
          </button>
        </form>
      </div>
    </div>
  );
}
