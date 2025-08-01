import { Request, Response } from 'express';
import { SolanaService } from '../services/solana.service';
import { MetaplexService } from '../services/metaplex.service';

export class MarketplaceController {
    private solanaService: SolanaService;
    private metaplexService: MetaplexService;

    constructor(walletPath?: string) {
        this.solanaService = new SolanaService(walletPath);
        this.metaplexService = new MetaplexService(
            this.solanaService.getConnection(),
            this.solanaService.getWallet()
        );
    }

    public async createListing(req: Request, res: Response): Promise<void> {
        try {
            const { nftAddress, price, walletAddress } = req.body;
            console.log('📝 Create listing request:', { nftAddress, price, walletAddress });
            
            if (!nftAddress || !price || !walletAddress) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: nftAddress, price, walletAddress'
                });
                return;
            }
            
            // Mock response for now
            const mockResponse = {
                success: true,
                listingId: `listing_${Date.now()}`,
                nftAddress: nftAddress,
                price: price,
                seller: walletAddress,
                message: 'NFT listed successfully (mock)',
                transactionId: `${Math.random().toString(36).substring(2, 15)}`
            };
            
            console.log('✅ Listing created:', mockResponse);
            res.status(201).json(mockResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ error: errorMessage });
        }
    }

    public async buyNft(req: Request, res: Response): Promise<void> {
        try {
            const { listingId } = req.params;
            const result = await this.solanaService.buyNft(listingId);
            res.status(200).json(result);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ error: errorMessage });
        }
    }

    public async cancelListing(req: Request, res: Response): Promise<void> {
        try {
            const { listingId } = req.params;
            console.log('🚫 Cancel listing request for:', listingId);
            
            // Mock response for now
            const mockResponse = {
                success: true,
                listingId: listingId,
                message: 'Listing cancelled successfully (mock)',
                transactionId: `${Math.random().toString(36).substring(2, 15)}`
            };
            
            res.status(200).json(mockResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ error: errorMessage });
        }
    }

    public async getListings(req: Request, res: Response): Promise<void> {
        try {
            console.log('🏪 Get marketplace listings request');
            
            // Mock marketplace listings
            const mockListings = [
                {
                    id: '1',
                    name: 'Cosmic Cat #001',
                    description: 'A rare cosmic cat NFT with stellar powers',
                    image: 'https://via.placeholder.com/400x400/9945FF/FFFFFF?text=Cosmic+Cat',
                    price: 2.5,
                    seller: 'A9E6YZGpNxr2pPuu7BrhprGsnM2F6YpJhdA4YsiuHUbs',
                    isListed: true,
                    attributes: [
                        { trait_type: 'Type', value: 'Cat' },
                        { trait_type: 'Background', value: 'Cosmic' },
                        { trait_type: 'Rarity', value: 'Legendary' }
                    ],
                    collection: 'Cosmic Pets',
                    creator: 'A9E6YZGpNxr2pPuu7BrhprGsnM2F6YpJhdA4YsiuHUbs',
                    royalty: 7
                },
                {
                    id: '2',
                    name: 'Digital Dreamscape',
                    description: 'An abstract digital art piece exploring virtual reality',
                    image: 'https://via.placeholder.com/400x400/00D4AA/FFFFFF?text=Digital+Art',
                    price: 1.8,
                    seller: 'B8F7XZHpOyr3qQvv8CsiprGtnN3G7ZqKieB5ZtjvIVct',
                    isListed: true,
                    attributes: [
                        { trait_type: 'Style', value: 'Abstract' },
                        { trait_type: 'Theme', value: 'Digital' },
                        { trait_type: 'Rarity', value: 'Rare' }
                    ],
                    collection: 'Digital Dreams',
                    creator: 'B8F7XZHpOyr3qQvv8CsiprGtnN3G7ZqKieB5ZtjvIVct',
                    royalty: 5
                },
                {
                    id: '3',
                    name: 'Solana Sunset',
                    description: 'Beautiful sunset over the Solana blockchain',
                    image: 'https://via.placeholder.com/400x400/FF6B35/FFFFFF?text=Sunset',
                    price: 0.75,
                    seller: 'C9G8YZIpPzs4rRww9DtjqsHtoO4H8arLjfC6AukwJWdu',
                    isListed: true,
                    attributes: [
                        { trait_type: 'Theme', value: 'Nature' },
                        { trait_type: 'Time', value: 'Sunset' },
                        { trait_type: 'Rarity', value: 'Common' }
                    ],
                    collection: 'Nature Scenes',
                    creator: 'C9G8YZIpPzs4rRww9DtjqsHtoO4H8arLjfC6AukwJWdu',
                    royalty: 3
                }
            ];
            
            res.status(200).json({ data: mockListings });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ error: errorMessage });
        }
    }

    public async getUserListings(req: Request, res: Response): Promise<void> {
        try {
            const { walletAddress } = req.params;
            console.log('👤 Get user listings request for:', walletAddress);
            
            // Mock user listings
            const mockUserListings = [
                {
                    id: '1',
                    nft: {
                        id: '1',
                        name: 'My Listed NFT',
                        description: 'NFT I put up for sale',
                        image: 'https://via.placeholder.com/400x400/9945FF/FFFFFF?text=My+NFT',
                        price: 1.5,
                        seller: walletAddress,
                        isListed: true,
                        attributes: [
                            { trait_type: 'Type', value: 'Custom' },
                            { trait_type: 'Rarity', value: 'Rare' }
                        ],
                        collection: 'My Collection',
                        creator: walletAddress,
                        royalty: 5
                    },
                    price: 1.5,
                    seller: walletAddress,
                    createdAt: new Date().toISOString(),
                    isActive: true
                }
            ];
            
            res.status(200).json({ data: mockUserListings });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ error: errorMessage });
        }
    }
}