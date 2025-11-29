import { useState } from 'react';
import { Header } from './Header';
import { ArrowLeft, MapPin, CreditCard, CheckCircle2, QrCode } from 'lucide-react';
import { ImageWithFallback } from './picture/ImageWithFallback';

interface Branch {
  id: string;
  name: string;
  address: string;
}

interface CartItem {
  coffeeId: string;
  quantity: number;
  coffee?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface CheckoutPageProps {
  cart: CartItem[];
  branches: Branch[];
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
  const [showQRIS, setShowQRIS] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const total = cart.reduce((sum, item) => sum + (item.coffee?.price || 0) * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowQRIS(true);
  };

  const handlePayNow = () => {
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentCompleted(true);
      setLoading(false);
      
      // Countdown before completing order
      let count = 5;
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        
        if (count === 0) {
          clearInterval(timer);
          completeOrder();
        }
      }, 1000);
    }, 2000);
  };

  const completeOrder = async () => {
    try {
      await onSubmitOrder(paymentName, notes);
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const selectedBranchData = branches.find((b) => b.id === selectedBranch);

  // Generate QRIS data (in production, this would come from payment gateway)
  const qrisData = `QRIS.MyBKOP.${Date.now()}.${total}`;

  if (showQRIS) {
    return (
      <div className="pb-20 min-h-screen bg-gray-50">
        <Header title="Pembayaran QRIS" />

        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <button
            onClick={() => {
              setShowQRIS(false);
              setPaymentCompleted(false);
              setCountdown(5);
            }}
            className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900 transition-colors"
            disabled={loading || paymentCompleted}
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>

          <div className="max-w-md mx-auto">
            {!paymentCompleted ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl mb-2">Scan QRIS untuk Bayar</h2>
                  <p className="text-gray-600">
                    Gunakan aplikasi mobile banking atau e-wallet Anda
                  </p>
                </div>

                {/* QR Code Placeholder */}
                <div className="flex justify-center mb-6 bg-white p-4 rounded-lg border-2 border-amber-200">
                  <div className="w-64 h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                    <QrCode className="w-16 h-16 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-center text-sm">
                      QR Code akan muncul di sini
                    </p>
                    <p className="text-gray-400 text-xs mt-2 text-center">
                      Demo: {qrisData}
                    </p>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-amber-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Pembayaran</span>
                    <span className="text-2xl text-amber-600">
                      Rp {total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="border-t pt-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Detail Pesanan:</p>
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">
                        {item.quantity}x {item.coffee?.name}
                      </span>
                      <span className="text-gray-600">
                        Rp {((item.coffee?.price || 0) * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-center text-sm text-gray-500 mb-4">
                  <p>Atau klik tombol di bawah untuk simulasi pembayaran</p>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handlePayNow}
                  disabled={loading}
                  className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Memproses Pembayaran...' : 'Bayar Sekarang (Demo)'}
                </button>

                <p className="text-xs text-center text-gray-500 mt-3">
                  QR Code ini hanya untuk demo. Di produksi akan terintegrasi dengan payment gateway.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                </div>

                <h2 className="text-2xl mb-2">Pembayaran Berhasil!</h2>
                <p className="text-gray-600 mb-6">
                  Terima kasih, pesanan Anda sedang diproses
                </p>

                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Total Dibayar</span>
                    <span className="text-xl text-green-600">
                      Rp {total.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Atas Nama: {paymentName}</p>
                    <p>Lokasi: {selectedBranchData?.name}</p>
                  </div>
                </div>

                <p className="text-gray-500 mb-4">
                  Mengarahkan ke halaman utama dalam <span className="text-amber-600">{countdown}</span> detik...
                </p>

                <button
                  onClick={completeOrder}
                  className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Kembali ke Beranda
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
              {/* Payment Method Badge */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Metode Pembayaran</p>
                  <p className="text-amber-700">QRIS - Scan & Pay</p>
                </div>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/QRIS_logo.svg/1200px-QRIS_logo.svg.png" 
                  alt="QRIS" 
                  className="h-8"
                />
              </div>

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
                      {item.quantity} x Rp {(item.coffee?.price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <p className="text-amber-600">
                    Rp {((item.coffee?.price || 0) * item.quantity).toLocaleString('id-ID')}
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
            Lanjut ke Pembayaran QRIS
          </button>
        </form>
      </div>
    </div>
  );
}