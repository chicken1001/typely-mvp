'use client';
import { useState } from 'react';

export default function AICommandBar({ onCommand }: { onCommand: (result: any) => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const { result } = await res.json();
      onCommand({ ...result, timestamp: new Date().toISOString() });
      setInput('');
    } catch (error) {
      onCommand({ action: 'error', message: 'Something went wrong. Check console.' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Invoice NASA $25,000 for moon base redesign and send it now"
          className="flex-1 outline-none text-lg"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Send →'}
        </button>
      </div>
      <p className="text-center text-gray-500 text-sm mt-2">Try: “Add client Tesla” • “Invoice Tesla $12k”</p>
    </form>
  );
}
