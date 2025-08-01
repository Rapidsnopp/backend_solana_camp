import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { NFTCard, LoadingSpinner } from '../components';
import { useToast } from '../contexts';
import { nftService, marketplaceService } from '../services';
import { NFT } from './Marketplace';

export const MyNFTs: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'owned' | 'listed'>('owned');
  const [showListModal, setShowListModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [listPrice, setListPrice] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const { connected, publicKey } = useWallet();
  const { addToast } = useToast();

  useEffect(() => {
    if (connected && publicKey) {
      loadUserNFTs();
    } else {
      setNfts([]);
      setLoading(false);
    }
  }, [connected, publicKey, activeTab]);

  const loadUserNFTs = async () => {
    if (!publicKey) return;
    
    try {
      setLoading(true);
      if (activeTab === 'owned') {
        const response = await nftService.getUserNFTs(publicKey.toString());
        console.log('🎨 NFT data received:', response);
        console.log('🎨 NFT data array:', response.data);
        setNfts(response.data);
      } else {
        const response = await marketplaceService.getUserListings(publicKey.toString());
        setNfts(response.data.map(listing => listing.nft));
      }
    } catch (error) {
      console.error('Error loading user NFTs:', error);
      addToast('Failed to load your NFTs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleListNFT = async (nftId: string) => {
    const nft = nfts.find(n => n.id === nftId);
    if (nft) {
      setSelectedNFT(nft);
      setShowListModal(true);
    }
  };

  const handleSubmitListing = async () => {
    if (!selectedNFT || !listPrice || !publicKey) {
      addToast('Please enter a valid price', 'error');
      return;
    }

    const price = parseFloat(listPrice);
    if (isNaN(price) || price <= 0) {
      addToast('Please enter a valid price', 'error');
      return;
    }

    try {
      setListLoading(true);
      
      console.log('📝 Submitting listing:', {
        nftAddress: selectedNFT.id,
        price: price,
        walletAddress: publicKey.toString()
      });
      
      const response = await marketplaceService.createListing({
        nftAddress: selectedNFT.id, // Using id as nftAddress for now
        price: price,
        walletAddress: publicKey.toString()
      });
      
      console.log('✅ Listing response:', response);
      addToast('NFT listed successfully!', 'success');
      setShowListModal(false);
      setSelectedNFT(null);
      setListPrice('');
      loadUserNFTs(); // Refresh the list
    } catch (error) {
      console.error('❌ Error listing NFT:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addToast(`Failed to list NFT: ${errorMessage}`, 'error');
    } finally {
      setListLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowListModal(false);
    setSelectedNFT(null);
    setListPrice('');
  };

  const handleCancelListing = async (nftId: string) => {
    try {
      await marketplaceService.cancelListing(nftId);
      addToast('Listing cancelled successfully!', 'success');
      loadUserNFTs();
    } catch (error) {
      console.error('Error cancelling listing:', error);
      addToast('Failed to cancel listing', 'error');
    }
  };

  if (!connected) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            Please connect your Solana wallet to view and manage your NFT collection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          My <span className="gradient-text">NFT Collection</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Manage your NFTs and marketplace listings
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('owned')}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'owned'
                ? 'bg-solana-purple text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Owned NFTs
          </button>
          <button
            onClick={() => setActiveTab('listed')}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'listed'
                ? 'bg-solana-purple text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Listed for Sale
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="large" />
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {activeTab === 'owned' ? 'No NFTs Found' : 'No Active Listings'}
          </h3>
          <p className="text-gray-400 mb-6">
            {activeTab === 'owned'
              ? "You don't own any NFTs yet. Start by exploring the marketplace or creating your own!"
              : "You don't have any NFTs listed for sale. List some of your collection to start earning!"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {activeTab === 'owned' ? (
              <>
                <a href="/marketplace" className="btn-primary">
                  Explore Marketplace
                </a>
                <a href="/create" className="btn-secondary">
                  Create NFT
                </a>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('owned')}
                className="btn-primary"
              >
                View Owned NFTs
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card text-center">
              <div className="text-2xl font-bold gradient-text">{nfts.length}</div>
              <div className="text-sm text-gray-400">
                {activeTab === 'owned' ? 'NFTs Owned' : 'Listed NFTs'}
              </div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold gradient-text">
                {nfts.reduce((sum, nft) => sum + (nft.price || 0), 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Total Value (SOL)</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold gradient-text">
                {new Set(nfts.map(nft => nft.collection).filter(Boolean)).size}
              </div>
              <div className="text-sm text-gray-400">Collections</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold gradient-text">
                {nfts.filter(nft => nft.isListed).length}
              </div>
              <div className="text-sm text-gray-400">Listed</div>
            </div>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {nfts.map((nft) => {
              console.log('🎨 Rendering NFT:', nft);
              return (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                  onList={handleListNFT}
                  onCancel={handleCancelListing}
                  showPrice={activeTab === 'listed'}
                  showActions={true}
                  isOwned={activeTab === 'owned'}
                />
              );
            })}
          </div>
        </>
      )}

      {/* List NFT Modal */}
      {showListModal && selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">List NFT for Sale</h3>
            
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={selectedNFT.image}
                alt={selectedNFT.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-medium">{selectedNFT.name}</h4>
                <p className="text-sm text-gray-400">{selectedNFT.collection}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Price (SOL)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                placeholder="Enter price in SOL"
                className="input-field w-full"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCloseModal}
                className="btn-secondary flex-1"
                disabled={listLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitListing}
                className="btn-primary flex-1"
                disabled={listLoading || !listPrice}
              >
                {listLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="small" className="mr-2" />
                    Listing...
                  </div>
                ) : (
                  'List NFT'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
