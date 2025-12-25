import { PublicKey } from '@solana/web3.js';

export const mockPublicKey = new PublicKey('11111111111111111111111111111111');

export const createMockNft = (name: string, symbol: string, uri: string) => {
    return {
        name,
        symbol,
        uri,
        seller: mockPublicKey,
        price: 1,
    };
};

export const mockMarketplaceListings = [
    createMockNft('NFT 1', 'NFT1', 'https://example.com/nft1'),
    createMockNft('NFT 2', 'NFT2', 'https://example.com/nft2'),
    createMockNft('NFT 3', 'NFT3', 'https://example.com/nft3'),
];

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));