'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PriceCard from '../../components/price_cards';

interface LiveRate {
  rate_999_per_10gram: number;
  rate_22kt_per_10gram: number;
  rate_18kt_per_10gram: number;
  valid: boolean;
}

const GoldDivider = () => (
  <div className="flex items-center gap-3 w-full">
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #D1B000)' }} />
    <span style={{ color: '#D1B000' }} className="text-xs">◆</span>
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #D1B000)' }} />
  </div>
);

const BullionContent = () => {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [liveRate, setLiveRate] = useState<LiveRate | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [quantity, setQuantity] = useState(100);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'no_inventory'>('idle');
  const [dialogStep, setDialogStep] = useState<'select' | 'confirm'>('select');
  const [lockId, setLockId] = useState<number | null>(null);
  const [lockedRate, setLockedRate] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/bullion_auth_status')
      .then(r => r.json())
      .then(data => {
        if (!data.authenticated) {
          router.replace('/bullion/login');
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => router.replace('/bullion/login'));
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    const rustUrl = process.env.NEXT_PUBLIC_RUST_BACKEND_URL ?? 'http://localhost:8080';
    const es = new EventSource(`${rustUrl}/live_rate_stream`);
    es.onmessage = (event) => {
      setLiveRate(JSON.parse(event.data));
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  // Start timer when dialog opens, clear when it closes
  useEffect(() => {
    if (showDialog) {
      setTimeLeft(60);
      setBookingStatus('idle');
      setDialogStep('select');
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setShowDialog(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showDialog]);

  if (!authChecked) return null;

  const totalValue = liveRate ? (liveRate.rate_999_per_10gram / 10) * quantity : 0;
  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f97316' : '#D1B000';

  return (
    <main className="flex flex-col items-center p-4 sm:p-6 lg:p-10 xl:p-12 2xl:p-16">
      <div className="w-full max-w-7xl flex flex-col gap-6">

        {/* Section heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
            Live Bullion Rates
          </h2>
          <GoldDivider />

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          >
            <span style={{ color: '#D1B000' }}>◆</span>
            {lastUpdated ? `Last Updated: ${lastUpdated}` : 'Connecting...'}
            <span style={{ color: '#D1B000' }}>◆</span>
          </div>

          <p className="text-xs opacity-50 tracking-wide">
            Prices per 10g &nbsp;·&nbsp; Exclusive of GST &nbsp;·&nbsp; Live rate
          </p>
        </div>

        {/* Price cards — centred, max width on desktop */}
        <div className="flex flex-col gap-3 w-full max-w-lg mx-auto">
          <PriceCard
            title="Gold 999"
            price={liveRate?.rate_999_per_10gram}
            onBuy={liveRate?.valid ? () => setShowDialog(true) : undefined}
          />
          <PriceCard
            title="Gold 995"
            price={liveRate ? (liveRate.rate_999_per_10gram * 995 / 999) : undefined}
          />
        </div>

      </div>

      {/* Success toast */}
      {bookingStatus === 'success' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold bg-green-600 text-white">
          ✓ Booking confirmed at ₹{lockedRate?.toLocaleString('en-IN')} — you will be contacted shortly.
        </div>
      )}

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md flex flex-col gap-5 shadow-xl">

            {/* Header + timer */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                {dialogStep === 'select' ? 'Buy Gold 999' : 'Confirm Purchase'}
              </h3>
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border"
                style={{ color: timerColor, borderColor: timerColor }}
              >
                ⏱ {timeLeft}s
              </div>
            </div>

            <GoldDivider />

            {dialogStep === 'select' ? (
              <>
                {/* Rate display */}
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">Rate (per 10g)</span>
                  <span className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                    ₹{liveRate?.rate_999_per_10gram.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Quantity selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm opacity-70">Quantity (grams)</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-border bg-background text-foreground"
                  >
                    {[100, 200, 300, 400, 500].map(q => (
                      <option key={q} value={q}>{q}g</option>
                    ))}
                  </select>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-border pt-3">
                  <span className="text-sm opacity-70">Total Value</span>
                  <span className="text-xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                    ₹{totalValue.toLocaleString('en-IN')}
                  </span>
                </div>

                {bookingStatus === 'no_inventory' && (
                  <div className="text-sm text-center py-2 px-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                    Insufficient inventory — please try a smaller quantity or check back later.
                  </div>
                )}
                {bookingStatus === 'error' && (
                  <div className="text-sm text-center py-2 px-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                    Something went wrong. Please try again.
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDialog(false)}
                    className="flex-1 py-2 rounded-lg border border-border font-medium hover:opacity-70 transition-opacity"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={bookingStatus === 'loading'}
                    onClick={async () => {
                      setBookingStatus('loading');
                      try {
                        const response = await fetch('/api/booking', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ quantity_grams: quantity }),
                        });
                        if (response.status === 409) {
                          setBookingStatus('no_inventory');
                        } else if (!response.ok) {
                          setBookingStatus('error');
                        } else {
                          const data = await response.json();
                          setLockId(data.lock_id);
                          setLockedRate(data.rate_999);
                          setBookingStatus('idle');
                          setDialogStep('confirm');
                        }
                      } catch (err) {
                        setBookingStatus('error');
                      }
                    }}
                    className="flex-1 py-2 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                  >
                    {bookingStatus === 'loading' ? 'Processing...' : 'Lock Rate'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Locked rate summary */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">Locked Rate (per 10g)</span>
                    <span className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                      ₹{lockedRate?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">Quantity</span>
                    <span className="text-lg font-semibold">{quantity}g</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-3">
                    <span className="text-sm opacity-70">Total Value</span>
                    <span className="text-xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                      ₹{lockedRate ? ((lockedRate / 10) * quantity).toLocaleString('en-IN') : 0}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-center opacity-50">
                  This rate is locked. Confirm before the timer expires.
                </p>

                {bookingStatus === 'error' && (
                  <div className="text-sm text-center py-2 px-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                    Something went wrong. Please try again.
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDialog(false)}
                    className="flex-1 py-2 rounded-lg border border-border font-medium hover:opacity-70 transition-opacity"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={bookingStatus === 'loading'}
                    onClick={async () => {
                      setBookingStatus('loading');
                      try {
                        const response = await fetch('/api/booking_confirm', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ lock_id: lockId }),
                        });
                        if (response.status === 410) {
                          setBookingStatus('error');
                          setShowDialog(false);
                        } else if (!response.ok) {
                          setBookingStatus('error');
                        } else {
                          setBookingStatus('success');
                          setShowDialog(false);
                        }
                      } catch (err) {
                        setBookingStatus('error');
                      }
                    }}
                    className="flex-1 py-2 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                  >
                    {bookingStatus === 'loading' ? 'Confirming...' : 'Confirm'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </main>
  );
};

export default BullionContent;
