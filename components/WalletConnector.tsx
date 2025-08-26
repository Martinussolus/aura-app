'use client';

import React, { useState, useEffect } from 'react';
import { connect, keyStores } from 'near-api-js';
import { WalletConnection } from 'near-api-js'; // This line is problematic
import { supabase } from '@/lib/supabase';

const WalletConnector = () => {
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

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
      setWalletConnection(wallet);

      if (wallet.isSignedIn()) {
        const currentAccountId = wallet.getAccountId();
        setAccountId(currentAccountId);

        // Check if user exists in Supabase, if not create them
        const { data: user, error } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', currentAccountId)
          .single();

        if (error && error.code === 'PGRST116') {
          // User does not exist, create them
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ wallet_address: currentAccountId, username: currentAccountId.replace('.testnet', '') }])
            .single();
          if (insertError) {
            console.error('Error creating user:', insertError);
          }
        } else if (error) {
          console.error('Error fetching user:', error);
        }
      }
    };

    initNear();
  }, []);

  const handleConnect = () => {
    if (walletConnection) {
      walletConnection.requestSignIn(
        'aura.testnet', // contract requesting access
        'Aura' // optional title
      );
    }
  };

  const handleDisconnect = () => {
    if (walletConnection) {
      walletConnection.signOut();
      setAccountId(null);
    }
  };

  if (accountId) {
    return (
      <div>
        <p>Connected: {accountId}</p>
        <button onClick={handleDisconnect} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleConnect} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Connect Wallet
    </button>
  );
};

export default WalletConnector;
