'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import AICommandBar from '@/components/AICommandBar';
import { createClient } from '@/utils/supabase/client';

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const [history, setHistory] = useState<any[]>([]);  // ← this line fixes it

  if (!isLoaded) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold">
          Hey {isSignedIn ? 'Freelancer' : 'User'} → Total outstanding: $0
        </h1>
      </header>

      <AICommandBar onCommand={(cmd) => setHistory([...history, cmd])} />

      <div className="mt-32 max-w-2xl mx-auto space-y-4">
        {history.map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {JSON.stringify(item, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
