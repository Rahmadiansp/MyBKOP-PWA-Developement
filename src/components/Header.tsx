import { Coffee, MapPin } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBranchSelector?: boolean;
  selectedBranch?: string;
  branches?: Array<{ id: string; name: string; address: string }>;
  onBranchChange?: (branchId: string) => void;
}

export function Header({ 
  title, 
  showBranchSelector, 
  selectedBranch, 
  branches = [], 
  onBranchChange 
}: HeaderProps) {
  return (
    <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white">
      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-8 h-8" />
            <div>
              <h1 className="text-xl">{title}</h1>
              {showBranchSelector && selectedBranch && (
                <div className="flex items-center gap-1 text-sm text-amber-100 mt-1">
                  <MapPin className="w-4 h-4" />
                  <select
                    value={selectedBranch}
                    onChange={(e) => onBranchChange?.(e.target.value)}
                    className="bg-transparent border-none outline-none cursor-pointer"
                  >
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id} className="text-gray-900">
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
