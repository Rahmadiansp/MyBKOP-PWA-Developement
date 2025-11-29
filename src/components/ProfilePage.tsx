import { useState } from 'react';
import { Header } from './Header';
import { User, Mail, Phone, MapPin, Camera, LogOut, Save } from 'lucide-react';
import { ImageWithFallback } from './picture/ImageWithFallback';

interface ProfilePageProps {
  user: any;
  branches: any[];
  onUpdateProfile: (name: string, phone: string, branch: string) => Promise<void>;
  onUploadPhoto: (file: File) => Promise<void>;
  onLogout: () => void;
}

export function ProfilePage({
  user,
  branches,
  onUpdateProfile,
  onUploadPhoto,
  onLogout,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdateProfile(name, phone, branch);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoLoading(true);
      try {
        await onUploadPhoto(file);
      } finally {
        setPhotoLoading(false);
      }
    }
  };

  const selectedBranchData = branches.find((b) => b.id === branch);

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <Header title="Profil Saya" />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {user?.photoSignedUrl ? (
                <ImageWithFallback
                  src={user.photoSignedUrl}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-amber-600" />
                </div>
              )}
              
              <label className="absolute bottom-0 right-0 bg-amber-600 text-white p-2 rounded-full cursor-pointer hover:bg-amber-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={photoLoading}
                  className="hidden"
                />
              </label>
            </div>
            
            {photoLoading && (
              <p className="text-sm text-gray-500 mt-2">Mengupload foto...</p>
            )}
          </div>

          {/* Role Badge */}
          <div className="flex justify-center mb-6">
            <span className={`px-4 py-1 rounded-full text-sm ${
              user?.role === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {user?.role === 'admin' ? 'Admin' : 'Customer'}
            </span>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <User className="w-4 h-4" />
                Nama Lengkap
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-500">
                {user?.email}
              </p>
              <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Phone className="w-4 h-4" />
                Nomor Telepon
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  {user?.phone || 'Belum diisi'}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                Cabang Favorit
              </label>
              {isEditing ? (
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  {selectedBranchData?.name || 'Belum dipilih'}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setName(user?.name || '');
                    setPhone(user?.phone || '');
                    setBranch(user?.branch || '');
                  }}
                  className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Edit Profil
              </button>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </div>
  );
}
