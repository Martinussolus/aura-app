'use client';

import React, { useState, useEffect } from 'react';
import { connect, keyStores } from 'near-api-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const DashboardPage = () => {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const initNear = async () => {
      const near = await connect({
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        headers: {},
      });

      const wallet = new WalletConnection(near, 'aura');

      if (wallet.isSignedIn()) {
        setAccountId(wallet.getAccountId());
      } else {
        router.push('/');
      }
    };

    initNear();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountId) {
      alert('You must be connected to create a post.');
      return;
    }

    // Get the user's id from the users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', accountId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      alert('Error fetching user data. Please try again.');
      return;
    }

    // Insert the new post into the content table
    const { error: insertError } = await supabase.from('content').insert([
      {
        creator_id: user.id,
        type: 'message',
        message_content: message,
      },
    ]);

    if (insertError) {
      console.error('Error creating post:', insertError);
      alert('Error creating post. Please try again.');
    } else {
      alert('Post created successfully!');
      setMessage('');
    }
  };

  if (!accountId) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Creator Dashboard</h1>
      <p className="mb-8">Welcome, {accountId}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 border border-gray-300 rounded text-black"
          rows={4}
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create Post
        </button>
      </form>
    </main>
  );
};

export default DashboardPage;
