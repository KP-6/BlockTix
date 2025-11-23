import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

const PaymentCheckout: React.FC = () => {
  const url = new URL(window.location.href);
  const amount = Number(url.searchParams.get('amount') || '0');
  const email = url.searchParams.get('email') || '';

  const [step, setStep] = useState<'method'|'processing'|'success'|'failed'>('method');
  const [method, setMethod] = useState<'card'|'upi'|'netbanking'>('card');
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upi, setUpi] = useState({ vpa: '' });

  useEffect(() => {
    // Centered popup styling could be controlled by the opener's window.open features
    document.title = 'Razorpay Checkout';
  }, []);

  const validate = useMemo(() => {
    return () => {
      if (method === 'card') {
        if (!/^\d{12,19}$/.test(card.number.replace(/\s+/g, ''))) return 'Enter a valid card number';
        if (!card.name.trim()) return 'Enter name on card';
        if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return 'Enter expiry as MM/YY';
        if (!/^\d{3,4}$/.test(card.cvv)) return 'Enter a valid CVV';
      } else if (method === 'upi') {
        if (!/^[\w.\-]+@[\w\-]+$/.test(upi.vpa)) return 'Enter a valid UPI ID (example@bank)';
      }
      return null;
    };
  }, [method, card, upi]);

  const handlePay = async () => {
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }
    setStep('processing');
    // Simulate gateway processing with staged delays
    await new Promise(r => setTimeout(r, 800));
    await new Promise(r => setTimeout(r, 900));
    // Success
    const paymentId = `pay_${Date.now()}_${Math.floor(Math.random()*100000)}`;
    setStep('success');
    try {
      // Notify opener
      if (window.opener) {
        window.opener.postMessage({ source: 'razorpay', status: 'success', paymentId }, '*');
      }
    } catch {}
    // Close after short delay
    setTimeout(() => {
      window.close();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Razorpay Checkout</h1>
          <div className="text-xs text-gray-500">Secured</div>
        </div>

        {step === 'method' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">Amount</div>
              <div className="text-2xl font-bold text-primary-600">₹{amount.toFixed(2)}</div>
            </div>
            <div className="text-xs text-gray-500">Receipt will be emailed to {email}</div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <div className="flex gap-2">
                {['card','upi','netbanking'].map((m) => (
                  <button key={m} onClick={()=>setMethod(m as any)} className={`px-3 py-1.5 rounded border text-sm ${method===m?'bg-primary-600 text-white border-primary-600':'border-gray-300 dark:border-gray-700'}`}>{m.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {method==='card' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1">Card Number</label>
                  <input value={card.number} onChange={e=>setCard({...card, number: e.target.value})} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="4111 1111 1111 1111" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1">Name on Card</label>
                  <input value={card.name} onChange={e=>setCard({...card, name: e.target.value})} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="Full Name" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Expiry (MM/YY)</label>
                  <input value={card.expiry} onChange={e=>setCard({...card, expiry: e.target.value})} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="12/29" />
                </div>
                <div>
                  <label className="block text-sm mb-1">CVV</label>
                  <input value={card.cvv} onChange={e=>setCard({...card, cvv: e.target.value})} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="123" />
                </div>
              </div>
            )}

            {method==='upi' && (
              <div>
                <label className="block text-sm mb-1">UPI ID</label>
                <input value={upi.vpa} onChange={e=>setUpi({ vpa: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="example@bank" />
              </div>
            )}

            {method==='netbanking' && (
              <div>
                <label className="block text-sm mb-1">Bank</label>
                <select className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>State Bank of India</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

            {error && <div className="text-sm text-error-600">{error}</div>}

            <button onClick={handlePay} className="w-full py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium">Pay Now</button>
            <button onClick={()=>window.close()} className="w-full py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200">Cancel</button>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-10 text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary-600" />
            <div className="text-gray-700 dark:text-gray-200">Processing your payment…</div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-10 text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-success-600" />
            <div className="text-lg font-semibold">Payment Successful</div>
            <div className="text-gray-600 dark:text-gray-300">Redirecting you back…</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCheckout;
