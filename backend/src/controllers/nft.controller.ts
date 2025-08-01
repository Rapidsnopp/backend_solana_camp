import { Request, Response } from 'express';
import { SolanaService } from '../services/solana.service';
import { MetaplexService } from '../services/metaplex.service';

export class NftController {
    private solanaService: SolanaService;
    private metaplexService: MetaplexService;
    // Store created NFTs temporarily in memory
    private static createdNfts: any[] = [];

    constructor(walletPath?: string) {
        this.solanaService = new SolanaService(walletPath);
        this.metaplexService = new MetaplexService(
            this.solanaService.getConnection(),
            this.solanaService.getWallet()
        );
    }

    public async getNftDetails(req: Request, res: Response): Promise<void> {
        const { nftId } = req.params;
        try {
            const nftDetails = await this.metaplexService.getNftDetails(nftId);
            res.status(200).json(nftDetails);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message: 'Error fetching NFT details', error: errorMessage });
        }
    }

    public async mintNft(req: Request, res: Response): Promise<void> {
        const { metadata } = req.body;
        try {
            const transaction = await this.metaplexService.mintNft(metadata);
            res.status(201).json(transaction);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message: 'Error minting NFT', error: errorMessage });
        }
    }

    public async uploadImage(req: Request, res: Response): Promise<void> {
        try {
            // For now, return a mock response since we don't have file upload setup
            // In a real implementation, you would upload to IPFS or similar
            console.log('📤 Image upload request received');
            console.log('📤 Request body:', req.body);
            
            const mockResponse = {
                success: true,
                url: `https://via.placeholder.com/400x400/FF6B35/FFFFFF?text=Uploaded+${Date.now()}`,
                ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}`,
                message: 'Image uploaded successfully (mock)'
            };
            
            console.log('📤 Upload response:', mockResponse);
            res.status(200).json(mockResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('❌ Upload error:', errorMessage);
            res.status(500).json({ message: 'Error uploading image', error: errorMessage });
        }
    }

    public async createNft(req: Request, res: Response): Promise<void> {
        try {
            console.log('🎨 NFT creation request received:', req.body);
            
            const { name, description, image, price, attributes } = req.body;
            const creator = req.body.creator || req.body.walletAddress || 'unknown';
            
            const newNft = {
                id: Date.now().toString(),
                name: name || 'Unnamed NFT',
                description: description || 'No description',
                image: image || 'https://via.placeholder.com/400x400/9945FF/FFFFFF?text=New+NFT',
                price: price || 0,
                seller: creator,
                isListed: false,
                attributes: attributes || [],
                collection: 'User Created',
                creator: creator,
                royalty: 5,
                createdAt: new Date().toISOString()
            };
            
            // Add to our temporary storage
            NftController.createdNfts.push(newNft);
            
            const mockResponse = {
                success: true,
                nft: newNft,
                nftAddress: `${Math.random().toString(36).substring(2, 15)}`,
                transactionId: `${Math.random().toString(36).substring(2, 15)}`,
                metadata: req.body,
                message: 'NFT created successfully (mock)'
            };
            
            console.log('✅ NFT created and stored:', newNft);
            res.status(201).json(mockResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message: 'Error creating NFT', error: errorMessage });
        }
    }

    public async getUserNfts(req: Request, res: Response): Promise<void> {
        try {
            const { walletAddress } = req.params;
            console.log('👤 Get user NFTs request for:', walletAddress);
            
            // Get user's created NFTs from temporary storage
            const userCreatedNfts = NftController.createdNfts.filter(
                nft => nft.creator === walletAddress || nft.seller === walletAddress
            );
            
            // Default mock NFT data
            const defaultMockNfts = [
                {
                    id: 'default-1',
                    name: 'Sample NFT #1',
                    description: 'This is a sample NFT for testing',
                    image: 'https://via.placeholder.com/400x400/9945FF/FFFFFF?text=NFT+1',
                    price: 0.5,
                    seller: walletAddress,
                    isListed: false,
                    attributes: [
                        { trait_type: 'Background', value: 'Purple' },
                        { trait_type: 'Rarity', value: 'Common' }
                    ],
                    collection: 'Test Collection',
                    creator: walletAddress,
                    royalty: 5,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'default-2',
                    name: 'Sample NFT #2',
                    description: 'Another test NFT',
                    image: 'https://via.placeholder.com/400x400/00D4AA/FFFFFF?text=NFT+2',
                    price: 1.2,
                    seller: walletAddress,
                    isListed: true,
                    attributes: [
                        { trait_type: 'Background', value: 'Green' },
                        { trait_type: 'Rarity', value: 'Rare' }
                    ],
                    collection: 'Test Collection',
                    creator: walletAddress,
                    royalty: 5,
                    createdAt: new Date().toISOString()
                }
            ];
            
            // Combine user created NFTs with default mock data
            const allNfts = [...userCreatedNfts, ...defaultMockNfts];
            
            console.log(`📋 Returning ${allNfts.length} NFTs for user:`, allNfts.length);
            res.status(200).json({ 
                data: allNfts,
                count: allNfts.length,
                userCreated: userCreatedNfts.length,
                defaultSamples: defaultMockNfts.length
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message: 'Error fetching user NFTs', error: errorMessage });
        }
    }

    public async transferNft(req: Request, res: Response): Promise<void> {
        const { nftId, toAddress } = req.body;
        try {
            const transaction = await this.solanaService.transferNft(nftId, toAddress);
            res.status(200).json(transaction);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message: 'Error transferring NFT', error: errorMessage });
        }
    }
}