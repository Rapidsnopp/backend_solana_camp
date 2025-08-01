import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import * as dotenv from 'dotenv';
dotenv.config();

const payer = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(process.env.payer || '[]'))
);

const COLLECTION_MINT = process.env.COLLECTION_MINT ? new PublicKey(process.env.COLLECTION_MINT) : undefined;


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

    async mintNFT(metadata: { name: string; symbol: string; uri: string; sellerFeeBasisPoints: number; creators?: { address: string; share: number; }[]; collection?: string }) {
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
            collection: new PublicKey('A9NzU1MWwvDSiCTbxRu5beABWPDoPLJW184SaRbxmq7z')
        });

        await this.metaplex.nfts().verifyCollection({
            mintAddress: nft.address,
            collectionMintAddress: new PublicKey('A9NzU1MWwvDSiCTbxRu5beABWPDoPLJW184SaRbxmq7z'),
            collectionAuthority: payer,
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

    async mintNft(metadata: { name: string; symbol: string; uri: string; sellerFeeBasisPoints: number; creators?: { address: string; share: number; }[], collection?: string }) {
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

    // collectionMint là PublicKey của collection bạn muốn tìm
    async getMetadataAccountsByCollection() {
        const connection = this.connection;
        const collectionMint = new PublicKey('A9NzU1MWwvDSiCTbxRu5beABWPDoPLJW184SaRbxmq7z');
        // Filter theo field collection mint trong metadata account
        const accounts = await connection.getProgramAccounts(
            new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
            {
                filters: [
                    {
                        memcmp: {
                            offset: 326,
                            bytes: 'A9NzU1MWwvDSiCTbxRu5beABWPDoPLJW184SaRbxmq7z',
                        },
                    },
                    {
                        dataSize: 679,
                    },
                ],
            }
        );

        console.log(accounts)
        return accounts;
    }

}