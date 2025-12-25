import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { NFT } from '../../pages/Marketplace';

interface NFTCardProps {
  nft: NFT;
  onPurchase?: (nftId: string) => void;
  onList?: (nftId: string) => void;
  onCancel?: (nftId: string) => void;
  showPrice?: boolean;
  showActions?: boolean;
  isOwned?: boolean;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  onPurchase,
  onList,
  onCancel,
  showPrice = false,
  showActions = true,
  isOwned = false
}) => {
  const { connected, publicKey } = useWallet();
  const isOwner = connected && publicKey && nft.seller === publicKey.toString();

  console.log('🎨 NFTCard rendering:', nft.name, 'Image URL:', nft.image);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <Link to={`/nft/${nft.id}`} className="block">
      <div className="nft-card group">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2WYEpNBeEEKm8F2BULZrGq4IMMAAGGcvDng&s'; // Better fallback
            }}
          />
          {nft.isListed && (
            <div className="absolute top-2 right-2">
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Listed
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Collection and Creator */}
          {nft.collection && (
            <p className="text-sm text-solana-purple font-medium">
              {nft.collection}
            </p>
          )}

          {/* Name */}
          <h3 className="font-semibold text-lg text-white group-hover:text-solana-purple transition-colors line-clamp-1">
            {nft.name}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm line-clamp-2">
            {nft.description}
          </p>

          {/* Creator */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-solana-purple to-solana-green rounded-full"></div>
            <span className="text-sm text-gray-400">
              {nft.creator.slice(0, 4)}...{nft.creator.slice(-4)}
            </span>
          </div>

          {/* Price and Actions */}
          {showPrice && nft.isListed && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <div>
                <p className="text-xs text-gray-400">Price</p>
                <p className="font-semibold text-lg flex items-center">
                  <span className="text-solana-purple">{nft.price}</span>
                  <span className="text-sm text-gray-400 ml-1">SOL</span>
                </p>
              </div>
              
              {showActions && connected && !isOwner && (
                <button
                  onClick={(e) => onPurchase && handleAction(e, () => onPurchase(nft.id))}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Buy Now
                </button>
              )}
            </div>
          )}

          {/* Owner Actions */}
          {isOwned && showActions && (
            <div className="flex gap-2 pt-2 border-t border-gray-700">
              {!nft.isListed ? (
                <button
                  onClick={(e) => onList && handleAction(e, () => onList(nft.id))}
                  className="btn-primary text-sm py-2 px-4 flex-1"
                >
                  List for Sale
                </button>
              ) : (
                <button
                  onClick={(e) => onCancel && handleAction(e, () => onCancel(nft.id))}
                  className="btn-secondary text-sm py-2 px-4 flex-1"
                >
                  Cancel Listing
                </button>
              )}
              <button
                onClick={(e) => handleAction(e, () => {
                  // Handle transfer action
                  console.log('Transfer NFT:', nft.id);
                })}
                className="btn-secondary text-sm py-2 px-4"
              >
                Transfer
              </button>
            </div>
          )}

          {/* Attributes Preview */}
          {nft.attributes && nft.attributes.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {nft.attributes.slice(0, 3).map((attr, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded"
                >
                  {attr.trait_type}: {attr.value}
                </span>
              ))}
              {nft.attributes.length > 3 && (
                <span className="text-xs text-gray-400 px-2 py-1">
                  +{nft.attributes.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
