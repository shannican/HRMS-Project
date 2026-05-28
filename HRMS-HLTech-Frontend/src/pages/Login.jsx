import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authHooks';
import toast from 'react-hot-toast';
import {jwtDecode} from 'jwt-decode';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, switchUser, activeTokenKey } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [isAdminOrHr, setIsAdminOrHr] = useState(false);

  // Check for newUser query parameter
  const queryParams = new URLSearchParams(location.search);
  const isNewUser = queryParams.get('newUser') === 'true';

  // Load available accounts and check for admin/HR roles
  useEffect(() => {
    const tokenKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith('token_')
    );
    const accounts = tokenKeys.map((key) => {
      const token = localStorage.getItem(key);
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded token for key:', key, decoded);

        const isAdminOrHrRole = decoded.role === 'admin' || decoded.role === 'hr';
        return {
          tokenKey: key,
          email: decoded.email || key.replace('token_', '').replace('_', '@'),
          role: decoded.role,
          isAdminOrHr: isAdminOrHrRole,
        };
      } catch (error) {
        console.error('Error decoding token for account:', key, error);
        return null;
      }
    }).filter((account) => account);

    setAvailableAccounts(accounts);

    // Skip auto-redirect for new users
    if (isNewUser) {
      console.log('New user detected via query param, skipping auto-redirect');
      return;
    }

    // Check active token for admin/HR role
    const activeToken = localStorage.getItem(activeTokenKey || 'token');
    if (activeToken) {
      try {
        const decoded = jwtDecode(activeToken);
        console.log('Decoded active token:', decoded);
        const isActiveAdminOrHr = decoded.role === 'admin' || decoded.role === 'hr';
        setIsAdminOrHr(isActiveAdminOrHr);

        if (isActiveAdminOrHr) {
          console.log('Active token is for admin/HR, redirecting to /admin/dashboard');
          toast.success('Admin/HR account detected. Redirecting to dashboard...');
          navigate('/admin/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error decoding active token:', error);
        setIsAdminOrHr(false);
      }
    }
  }, [activeTokenKey, navigate, isNewUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    setError('');

    try {
      await login(email, password);
      toast.success('Login successful!');
      console.log('Login successful');
    } catch (err) {
      console.error('Login error:', err.message, err.stack);
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleSwitchAccount = (tokenKey) => {
    console.log('Switching to account with tokenKey:', tokenKey);
    switchUser(tokenKey);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <img
            src="http://storageserver.hltechindia.com/uploads/HL Tech Website/Logos/1751354137066-666021738.png"
            alt="HL Tech Logo"
            className="h-12 w-auto"
            onError={(e) => {
              console.error('Error loading logo image');
              e.target.src = 'https://via.placeholder.com/32';
            }}
          />
          <h2 className="text-xl font-bold text-gray-800">HRMS Login</h2>
        </div>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {isAdminOrHr && !isNewUser && (
          <p className="text-green-500 mb-4 text-center">
            Active account is an Admin/HR account.
          </p>
        )}

        {availableAccounts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Switch Account</h3>
            <div className="space-y-2">
              {availableAccounts.map((account) => (
                <button
                  key={account.tokenKey}
                  onClick={() => handleSwitchAccount(account.tokenKey)}
                  className={`w-full p-2 text-left rounded flex justify-between items-center ${
                    activeTokenKey === account.tokenKey
                      ? 'bg-blue-600 text-white'
                      : account.isAdminOrHr
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{account.email}</span>
                  {account.isAdminOrHr && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                      {account.role === 'admin' ? 'Admin' : 'HR'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;