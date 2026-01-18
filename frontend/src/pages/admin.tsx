'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface RateData {
  rate_18kt: number;
  rate_22kt: number;
  rate_24kt: number;
  rate_silver: number;
  arihant_rate_18kt: number;
  arihant_rate_22kt: number;
  arihant_rate_24kt: number;
  arihant_rate_silver: number;
  date?: string;
}

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState('');

  // Form state
  const [rateData, setRateData] = useState<RateData>({
    rate_18kt: 0,
    rate_22kt: 0,
    rate_24kt: 0,
    rate_silver: 0,
    arihant_rate_18kt: 0,
    arihant_rate_22kt: 0,
    arihant_rate_24kt: 0,
    arihant_rate_silver: 0,
  });
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    checkAuthStatus();
    fetchCurrentRates();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/gold_rate_admin/admin/status/`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setCurrentUser(data.username);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentRates = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/gold_rate_admin/metal-rate/`);
      const data = await response.json();
      setRateData({
        rate_18kt: data.rate_18kt || 0,
        rate_22kt: data.rate_22kt || 0,
        rate_24kt: data.rate_24kt || 0,
        rate_silver: data.rate_silver || 0,
        arihant_rate_18kt: data.arihant_rate_18kt || 0,
        arihant_rate_22kt: data.arihant_rate_22kt || 0,
        arihant_rate_24kt: data.arihant_rate_24kt || 0,
        arihant_rate_silver: data.arihant_silver || 0,
      });
      if (data.date) {
        setUpdateDate(data.date);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/gold_rate_admin/admin/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setCurrentUser(data.username);
        setPassword('');
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error. Please try again.');
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/gold_rate_admin/admin/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      setCurrentUser('');
      setUsername('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpdateRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMessage('');
    setUpdateError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/gold_rate_admin/admin/manual-rate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          date: updateDate,
          ...rateData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUpdateMessage('Rates updated successfully!');
        fetchCurrentRates();
      } else {
        setUpdateError(data.error || 'Update failed');
      }
    } catch (error) {
      setUpdateError('Network error. Please try again.');
      console.error('Update error:', error);
    }
  };

  const handleInputChange = (field: keyof RateData, value: string) => {
    const numValue = parseInt(value) || 0;
    setRateData(prev => ({ ...prev, [field]: numValue }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-primary text-primary-foreground py-2 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">Mangalore Jewellery Works</h1>
            <Link href="/" className="hover:underline">
              Back to Home
            </Link>
          </div>
        </header>
        <main className="flex-1 bg-background text-foreground py-6 px-4 flex flex-col justify-center items-center">
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              {loginError && (
                <div className="text-red-500 text-sm">{loginError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </main>
        <footer className="bg-muted text-muted-foreground py-2 px-4">
          <div className="container mx-auto text-center">
            <p className="text-xs">&copy; 2024 Mangalore Jewellery Works</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Mangalore Jewellery Works - Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {currentUser}</span>
            <Link href="/" className="hover:underline text-sm">
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="hover:underline text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-background text-foreground py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">Update Metal Prices</h2>

          <form onSubmit={handleUpdateRates} className="space-y-6">
            {/* Date Selection */}
            <div className="bg-white p-6 rounded-lg shadow">
              <label htmlFor="date" className="block text-lg font-medium mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={updateDate}
                onChange={(e) => setUpdateDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-sm text-gray-500 mt-2">
                Select the date for which you want to update prices. Leave as today to update current prices.
              </p>
            </div>

            {/* Retail Prices */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Retail Prices (Customer Display)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rate_18kt" className="block text-sm font-medium mb-2">
                    18kt Gold (₹)
                  </label>
                  <input
                    type="number"
                    id="rate_18kt"
                    value={rateData.rate_18kt}
                    onChange={(e) => handleInputChange('rate_18kt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="rate_22kt" className="block text-sm font-medium mb-2">
                    22kt Gold (₹)
                  </label>
                  <input
                    type="number"
                    id="rate_22kt"
                    value={rateData.rate_22kt}
                    onChange={(e) => handleInputChange('rate_22kt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="rate_24kt" className="block text-sm font-medium mb-2">
                    24kt Gold (₹)
                  </label>
                  <input
                    type="number"
                    id="rate_24kt"
                    value={rateData.rate_24kt}
                    onChange={(e) => handleInputChange('rate_24kt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="rate_silver" className="block text-sm font-medium mb-2">
                    Silver (₹)
                  </label>
                  <input
                    type="number"
                    id="rate_silver"
                    value={rateData.rate_silver}
                    onChange={(e) => handleInputChange('rate_silver', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Arihant Broker Prices */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Arihant Broker Prices (Reference)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="arihant_rate_18kt" className="block text-sm font-medium mb-2">
                    18kt Gold (₹)
                  </label>
                  <input
                    type="number"
                    id="arihant_rate_18kt"
                    value={rateData.arihant_rate_18kt}
                    onChange={(e) => handleInputChange('arihant_rate_18kt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="arihant_rate_22kt" className="block text-sm font-medium mb-2">
                    22kt Gold (₹)
                  </label>
                  <input
                    type="number"
                    id="arihant_rate_22kt"
                    value={rateData.arihant_rate_22kt}
                    onChange={(e) => handleInputChange('arihant_rate_22kt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="arihant_rate_24kt" className="block text-sm font-medium mb-2">
                    24kt Gold (₹)
                  </label>
                  <input
                    type="number"
                    id="arihant_rate_24kt"
                    value={rateData.arihant_rate_24kt}
                    onChange={(e) => handleInputChange('arihant_rate_24kt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="arihant_rate_silver" className="block text-sm font-medium mb-2">
                    Silver (₹)
                  </label>
                  <input
                    type="number"
                    id="arihant_rate_silver"
                    value={rateData.arihant_rate_silver}
                    onChange={(e) => handleInputChange('arihant_rate_silver', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {updateMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {updateMessage}
              </div>
            )}
            {updateError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {updateError}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/90 transition-colors font-semibold"
              >
                Update Prices
              </button>
              <button
                type="button"
                onClick={fetchCurrentRates}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Refresh Current Prices
              </button>
            </div>
          </form>

          <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">About Manual Price Updates</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Manual updates will override API-fetched prices for the selected date</li>
              <li>Use this when the API fails or when you need to set custom prices</li>
              <li>All prices are in Indian Rupees (₹) per gram</li>
              <li>Changes take effect immediately on the main website</li>
              <li>The system tracks who made the update and when</li>
            </ul>
          </div>
        </div>
      </main>
      <footer className="bg-muted text-muted-foreground py-2 px-4">
        <div className="container mx-auto text-center">
          <p className="text-xs">&copy; 2024 Mangalore Jewellery Works</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminPage;