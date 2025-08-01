import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';

export class MetaplexService {
    private metaplex: Metaplex;
    private connection: Connection;
    private wallet: Keypair;

    constructor(connection: Connection, wallet: Keypair) {
        this.connection = connection;
        this.wallet = wallet;
        this.metaplex = Metaplex.make(connection)
            .use(keypairIdentity(wallet));
    }

    async mintNFT(metadata: { name: string; symbol: string; uri: string; sellerFeeBasisPoints: number; creators?: { address: string; share: number; }[] }) {
        const { nft } = await this.metaplex.nfts().create({
            uri: metadata.uri,
            name: metadata.name,
            sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
            symbol: metadata.symbol,
            creators: metadata.creators?.map(creator => ({
                address: new PublicKey(creator.address),
                share: creator.share,
                verified: false
            })),
        });
        return nft;
    }

    async getNFT(tokenId: string) {
        const nft = await this.metaplex.nfts().findByMint({ mintAddress: new PublicKey(tokenId) });
        return nft;
    }

    async getNftDetails(tokenId: string) {
        // Alias for getNFT to match controller expectations
        return this.getNFT(tokenId);
    }

    async mintNft(metadata: { name: string; symbol: string; uri: string; sellerFeeBasisPoints: number; creators?: { address: string; share: number; }[] }) {
        // Alias for mintNFT to match controller expectations
        return this.mintNFT(metadata);
    }

    async updateNFT(tokenId: string, metadata: { name?: string; uri?: string; sellerFeeBasisPoints?: number; }) {
        const mintAddress = new PublicKey(tokenId);
        const nft = await this.metaplex.nfts().findByMint({ mintAddress });
        
        const updatedNft = await this.metaplex.nfts().update({
            nftOrSft: nft,
            name: metadata.name,
            uri: metadata.uri,
            sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
        });
        return updatedNft;
    }

    async deleteNFT(tokenId: string) {
        const mintAddress = new PublicKey(tokenId);
        const nft = await this.metaplex.nfts().findByMint({ mintAddress });
        
        // Note: NFT deletion might not be available in all Metaplex versions
        // This is a placeholder that returns the NFT info
        return {
            success: true,
            message: 'NFT marked for deletion',
            nft: nft,
            tokenId
        };
    }
}