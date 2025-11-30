'use client';
import { useState } from 'react';

export default function AICommandBar({ onCommand }: { onCommand: (cmd: string) => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    // Call API here in full version
    onCommand(input);
    setInput('');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Invoice NASA $25,000 for moon redesign..."
          className="flex-1 outline-none text-lg"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
        >
          {loading ? 'Thinking...' : 'Send →'}
        </button>
      </div>
      <p className="text-center text-gray-500 text-sm mt-2">
        Try: “Add client Tesla” • “Invoice Tesla $12k”
      </p>
    </form>
  );
}
