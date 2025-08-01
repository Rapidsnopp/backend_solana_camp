import React from 'react';
import { useParams } from 'react-router-dom';

export const NFTDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">NFT Detail Page</h1>
        <p className="text-gray-400 text-lg">NFT ID: {id}</p>
        <p className="text-gray-400 mt-4">This page is under development.</p>
      </div>
    </div>
  );
};
