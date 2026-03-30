import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/orders', label: 'Orders', icon: '🧾' },
  { path: '/inventory', label: 'Inventory', icon: '📋' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-surface-950/80 backdrop-blur-2xl border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">⚙️</span>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <Link key={item.path} to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              location.pathname === item.path
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">{user?.username}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <button onClick={logout}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
