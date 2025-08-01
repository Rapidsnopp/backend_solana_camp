import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export const Profile: React.FC = () => {
  const { connected, publicKey } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            Please connect your Solana wallet to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">
          <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Wallet: {publicKey?.toString()}
        </p>
        <p className="text-gray-400">This page is under development.</p>
      </div>
    </div>
  );
};
