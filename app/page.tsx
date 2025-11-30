'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import AICommandBar from '@/components/AICommandBar';
import { createClient } from '@/utils/supabase/client';

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const [history, setHistory] = useState([]);

  if (!isLoaded) return <div>Loading...</div>;

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Typely</h1>
          <p className="text-lg mb-6">The AI that runs your freelance business.</p>
          <a href="/sign-in" className="bg-black text-white px-6 py-3 rounded-lg">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">Hey {isSignedIn ? 'Freelancer' : 'User'} → Total outstanding: $0</h1>
      </header>
      <AICommandBar onCommand={(cmd) => setHistory([...history, cmd])} />
      <div className="mt-20 space-y-4">
        {history.map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow">
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
