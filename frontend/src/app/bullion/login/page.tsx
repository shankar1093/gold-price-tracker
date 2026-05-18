'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const GoldDivider = () => (
  <div className="flex items-center gap-3 w-full">
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #D1B000)' }} />
    <span style={{ color: '#D1B000' }} className="text-xs">◆</span>
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #D1B000)' }} />
  </div>
);

export default function BullionLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/bullion_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        window.location.href = '/bullion';
      } else {
        setError('Invalid username or password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm flex flex-col gap-6">

        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
            MJW Bullion
          </h2>
          <GoldDivider />
          <p className="text-sm opacity-50">Sign in to access live rates</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm opacity-70">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm opacity-70">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
            />
          </div>

          {error && (
            <div className="text-sm text-center py-2 px-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

      </div>
    </main>
  );
}
