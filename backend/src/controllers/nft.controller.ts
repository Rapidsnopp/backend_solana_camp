import { Request, Response } from 'express';
import { SolanaService } from '../services/solana.service';
import { MetaplexService } from '../services/metaplex.service';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { PublicKey } from '@solana/web3.js';
import { uploadFileToIPFSFromMulterFile } from '../utils/upload';

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
            const imageFile = req.files
            let imageUrl = 'https://via.placeholder.com/400x400/9945FF/FFFFFF?text=New+NFT';

            if (imageFile) {
                // Upload ảnh lên IPFS và lấy URL
                imageUrl = await uploadFileToIPFSFromMulterFile(imageFile as any);
            }
            const mockResponse = {
                success: true,
                url: imageUrl,
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
            const { name, description, price, attributes } = req.body;
            const imageFile = req.files;

            let imageUrl = 'https://via.placeholder.com/400x400/9945FF/FFFFFF?text=New+NFT';

            if (imageFile) {
                // Upload ảnh lên IPFS và lấy URL
                imageUrl = await uploadFileToIPFSFromMulterFile(imageFile as any);
            }

            const creator = req.body.creator || req.body.walletAddress || 'unknown';
            const collection = new PublicKey('A9NzU1MWwvDSiCTbxRu5beABWPDoPLJW184SaRbxmq7z');

            const newNft = {
                id: Date.now().toString(),
                name: name || 'Unnamed NFT',
                description: description || 'No description',
                image: imageUrl,
                price: price || 0,
                seller: creator,
                isListed: false,
                attributes: attributes || [],
                collection: collection.toBase58(),
                creator: creator,
                royalty: 5,
                createdAt: new Date().toISOString()
            };

            console.log('✅ NFT created and stored:', newNft);
            NftController.createdNfts.push(newNft);

            await this.metaplexService.mintNft({
                name: newNft.name,
                symbol: 'NFT',
                uri: newNft.image,
                sellerFeeBasisPoints: newNft.royalty,
                creators: [{ address: req.body.walletAddress, share: 100 }],
                collection: 'A9NzU1MWwvDSiCTbxRu5beABWPDoPLJW184SaRbxmq7z'
            });

            res.status(201).json({
                success: true,
                nft: newNft,
                message: 'NFT created and image uploaded to IPFS successfully'
            });
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
                    image: 'https://i.pinimg.com/236x/86/6e/52/866e52afc7a8f0788abad3e12080c761.jpg',
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

    public async getNftCollection(req: Request, res: Response): Promise<void> {
        try {
            const accounts = await this.metaplexService.getMetadataAccountsByCollection();

            const parsedAccounts = accounts.map((acc) => {
                const [metadata] = Metadata.deserialize(acc.account.data);
                return {
                    pubkey: acc.pubkey.toBase58(),
                    lamports: acc.account.lamports,
                    owner: acc.account.owner.toBase58(),
                    name: metadata.data.name.replace(/\0/g, ''),
                    symbol: metadata.data.symbol.replace(/\0/g, ''),
                    uri: metadata.data.uri.replace(/\0/g, ''),
                    collection: metadata.collection?.key.toBase58() || null,
                    verified: metadata.collection?.verified || false
                };
            });

            res.status(200).json({
                total: parsedAccounts.length,
                accounts: parsedAccounts
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message: 'Error fetching NFT collection', error: errorMessage });
        }
    }
}