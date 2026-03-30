import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message === 'Admin access only' 
        ? 'Only admin accounts can access this portal' 
        : err.response?.data?.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">⚙️</span>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-gray-400 mt-2">RetailMart Administration</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="input-field" placeholder="Enter username" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="Enter password" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full disabled:opacity-50 flex items-center justify-center">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> : 'Sign In'}
            </button>
          </form>

          {/* <p className="text-center text-gray-500 mt-6 text-xs">Default: admin / admin123</p> */}
        </div>
      </div>
    </div>
  );
}
