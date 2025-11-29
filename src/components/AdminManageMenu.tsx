import { useState } from 'react';
import { Header } from './Header';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { ImageWithFallback } from './picture/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-75c29e11`;

// Di file AdminManageMenu.tsx
interface AdminManageMenuProps {
  coffees: any[];
  accessToken: string;
  onAddCoffee: (coffee: any) => Promise<void>;
  onUpdateCoffee: (id: string, coffee: any) => Promise<void>;
  onDeleteCoffee: (id: string) => Promise<void>;
  onUploadImage: (file: File) => Promise<any>; // Tambahkan ini
}

export function AdminManageMenu({
  coffees,
  accessToken,
  onAddCoffee,
  onUpdateCoffee,
  onDeleteCoffee,
}: AdminManageMenuProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    imageStoragePath: '',
    category: 'Hot Coffee',
  });

  const categories = ['Hot Coffee', 'Iced Coffee', 'Specialty', 'Non Coffee'];

  const handleOpenModal = (coffee?: any) => {
    if (coffee) {
      setEditingCoffee(coffee);
      setFormData({
        name: coffee.name,
        description: coffee.description,
        price: coffee.price.toString(),
        image: coffee.image,
        imageStoragePath: coffee.imageStoragePath || '',
        category: coffee.category,
      });
      setPreviewUrl(coffee.image);
    } else {
      setEditingCoffee(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        imageStoragePath: '',
        category: 'Hot Coffee',
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCoffee(null);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', selectedFile);

      const res = await fetch(`${API_BASE}/admin/coffee-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formDataUpload,
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({
          ...formData,
          image: data.imageUrl,
          imageStoragePath: data.imageStoragePath,
        });
        setPreviewUrl(data.imageUrl);
        setSelectedFile(null);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal upload gambar');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload image first if there's a selected file
    if (selectedFile) {
      await handleUploadImage();
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setLoading(true);

    try {
      const coffeeData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image || previewUrl,
        imageStoragePath: formData.imageStoragePath,
        category: formData.category,
      };

      if (editingCoffee) {
        await onUpdateCoffee(editingCoffee.id, coffeeData);
      } else {
        await onAddCoffee(coffeeData);
      }

      handleCloseModal();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
      await onDeleteCoffee(id);
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <Header title="Kelola Menu Kopi" />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">{coffees.length} menu tersedia</p>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tambah Menu
          </button>
        </div>

        {/* Coffee List */}
        <div className="space-y-4">
          {coffees.map((coffee) => (
            <div
              key={coffee.id}
              className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4"
            >
              <ImageWithFallback
                src={coffee.image}
                alt={coffee.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="mb-1">{coffee.name}</h3>
                    <span className="inline-block bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-sm">
                      {coffee.category}
                    </span>
                  </div>
                  <p className="text-amber-600">
                    Rp {coffee.price.toLocaleString('id-ID')}
                  </p>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{coffee.description}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(coffee)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(coffee.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl">
                {editingCoffee ? 'Edit Menu' : 'Tambah Menu Baru'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Nama Menu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Contoh: Espresso"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Deskripsi menu..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="25000"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Gambar Menu
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 cursor-pointer transition-colors"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Pilih gambar dari komputer'}
                      </span>
                    </label>
                  </div>

                  {previewUrl && (
                    <div className="relative">
                      <ImageWithFallback
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {selectedFile && !formData.image && (
                        <div className="absolute top-2 right-2">
                          <button
                            type="button"
                            onClick={handleUploadImage}
                            disabled={uploadingImage}
                            className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 disabled:opacity-50"
                          >
                            {uploadingImage ? 'Uploading...' : 'Upload'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : editingCoffee ? 'Update' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}