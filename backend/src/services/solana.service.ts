import { Connection, PublicKey, Transaction, Keypair, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { 
    TOKEN_PROGRAM_ID, 
    getAssociatedTokenAddress, 
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    getAccount,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError
} from '@solana/spl-token';
import { Config } from '../config/config';
import { Logger } from '../utils/logger';

export class SolanaService {
    private connection: Connection;
    private wallet: Keypair;
    private program: Program<any> | null = null;
    private programId: PublicKey;

    constructor(walletPath?: string) {
        // Initialize connection from config
        this.connection = Config.createConnection();
        
        // Load wallet from file or generate new one
        this.wallet = Config.loadWalletFromFile(walletPath);
        Logger.logWallet(this.wallet, 'Service');
        
        // Get program ID from config
        this.programId = Config.PROGRAM_ID;
        
        // Initialize program
        this.initializeProgram();
    }

    private async initializeProgram() {
        try {
            const provider = new AnchorProvider(
                this.connection,
                {
                    publicKey: this.wallet.publicKey,
                    signTransaction: async (tx: any) => tx,
                    signAllTransactions: async (txs: any[]) => txs
                } as any,
                { commitment: 'confirmed' }
            );
            
            // Initialize program with IDL from config
            this.program = new Program(Config.IDL as any, this.programId, provider);
            Logger.logSuccess('Anchor Program Initialization', {
                programId: this.programId.toString(),
                cluster: Config.CLUSTER
            });
        } catch (error) {
            Logger.logError('Anchor Program Initialization', error);
        }
    }

    getConnection(): Connection {
        return this.connection;
    }

    getWallet(): Keypair {
        return this.wallet;
    }

    async getAccountInfo(publicKey: string) {
        const accountInfo = await this.connection.getAccountInfo(new PublicKey(publicKey));
        return accountInfo;
    }

    async sendTransaction(transaction: Transaction, payer: Keypair) {
        const signature = await this.connection.sendTransaction(transaction, [payer]);
        await this.connection.confirmTransaction(signature);
        return signature;
    }

    async getNftBalance(nftMint: string, owner: string) {
        Logger.logStart('Get NFT Balance', { nftMint, owner });
        
        try {
            const nftValidation = Config.validatePublicKey(nftMint);
            if (!nftValidation.isValid) {
                throw new Error(`Invalid NFT mint: ${nftValidation.error}`);
            }
            
            const ownerValidation = Config.validatePublicKey(owner);
            if (!ownerValidation.isValid) {
                throw new Error(`Invalid owner address: ${ownerValidation.error}`);
            }
            
            const mint = nftValidation.publicKey!;
            const ownerPubkey = ownerValidation.publicKey!;
            
            // Get associated token account
            const tokenAccount = await getAssociatedTokenAddress(mint, ownerPubkey);
            
            try {
                const account = await getAccount(this.connection, tokenAccount);
                const balance = Number(account.amount);
                
                const result = {
                    success: true,
                    balance,
                    hasNft: balance > 0,
                    tokenAccount: tokenAccount.toString()
                };
                
                Logger.logSuccess('Get NFT Balance', result);
                return result;
            } catch (error) {
                if (error instanceof TokenAccountNotFoundError) {
                    const result = {
                        success: true,
                        balance: 0,
                        hasNft: false,
                        tokenAccount: tokenAccount.toString(),
                        message: 'Token account not found'
                    };
                    
                    Logger.logSuccess('Get NFT Balance', result);
                    return result;
                }
                throw error;
            }
        } catch (error) {
            Logger.logError('Get NFT Balance', error);
            throw error;
        }
    }

    async validateNftOwnership(nftMint: string, expectedOwner: string) {
        Logger.logStart('Validate NFT Ownership', { nftMint, expectedOwner });
        
        try {
            const balance = await this.getNftBalance(nftMint, expectedOwner);
            
            const result = {
                isOwner: balance.hasNft && balance.balance >= 1,
                balance: balance.balance,
                tokenAccount: balance.tokenAccount
            };
            
            Logger.logSuccess('Validate NFT Ownership', result);
            return result;
        } catch (error) {
            Logger.logError('Validate NFT Ownership', error);
            throw error;
        }
    }

    async createListing(nftId: string, price: number) {
        Logger.logStart('Create Listing', { nftId, price });
        
        try {
            // Validate inputs
            const nftValidation = Config.validatePublicKey(nftId);
            if (!nftValidation.isValid) {
                throw new Error(`Invalid NFT ID: ${nftValidation.error}`);
            }
            
            if (price <= 0) {
                throw new Error('Price must be greater than 0');
            }
            
            if (!this.program) {
                throw new Error('Anchor program not initialized');
            }

            const nftMint = nftValidation.publicKey!;
            const priceInLamports = new BN(price * web3.LAMPORTS_PER_SOL);
            
            // Generate listing account
            const listingAccount = web3.Keypair.generate();
            
            // Find marketplace PDA
            const [marketplace] = await PublicKey.findProgramAddress(
                [Buffer.from('marketplace')],
                this.programId
            );

            // Create listing instruction
            const tx = await this.program.methods
                .createListing(priceInLamports)
                .accounts({
                    listing: listingAccount.publicKey,
                    marketplace: marketplace,
                    nftMint: nftMint,
                    seller: this.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .signers([listingAccount])
                .rpc();

            const result = {
                success: true,
                listingId: listingAccount.publicKey.toString(),
                nftId,
                price,
                signature: tx,
                message: 'Listing created successfully'
            };
            
            Logger.logTransaction(tx, 'Create Listing', {
                listingId: result.listingId,
                nftMint: nftId,
                price: price
            });
            
            Logger.logSuccess('Create Listing', result);
            return result;
        } catch (error) {
            Logger.logError('Create Listing', error);
            throw error;
        }
    }

    async buyNft(listingId: string) {
        Logger.logStart('Buy NFT', { listingId });
        
        try {
            // Validate inputs
            const listingValidation = Config.validatePublicKey(listingId);
            if (!listingValidation.isValid) {
                throw new Error(`Invalid listing ID: ${listingValidation.error}`);
            }
            
            if (!this.program) {
                throw new Error('Anchor program not initialized');
            }

            const listingAccount = listingValidation.publicKey!;
            
            // Find marketplace PDA
            const [marketplace] = await PublicKey.findProgramAddress(
                [Buffer.from('marketplace')],
                this.programId
            );

            // Get listing data
            const listingData: any = await this.program.account.listing.fetch(listingAccount);
            
            const tx = await this.program.methods
                .buyNft()
                .accounts({
                    listing: listingAccount,
                    marketplace: marketplace,
                    nftMint: listingData.nftMint,
                    buyer: this.wallet.publicKey,
                    seller: listingData.seller,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();

            const result = {
                success: true,
                listingId,
                signature: tx,
                message: 'NFT purchased successfully'
            };
            
            Logger.logTransaction(tx, 'Buy NFT', {
                listingId,
                buyer: this.wallet.publicKey.toString(),
                seller: listingData.seller.toString()
            });
            
            Logger.logSuccess('Buy NFT', result);
            return result;
        } catch (error) {
            Logger.logError('Buy NFT', error);
            throw error;
        }
    }

    async cancelListing(listingId: string) {
        Logger.logStart('Cancel Listing', { listingId });
        
        try {
            // Validate inputs
            const listingValidation = Config.validatePublicKey(listingId);
            if (!listingValidation.isValid) {
                throw new Error(`Invalid listing ID: ${listingValidation.error}`);
            }
            
            if (!this.program) {
                throw new Error('Anchor program not initialized');
            }

            const listingAccount = listingValidation.publicKey!;
            
            // Find marketplace PDA
            const [marketplace] = await PublicKey.findProgramAddress(
                [Buffer.from('marketplace')],
                this.programId
            );

            const tx = await this.program.methods
                .cancelListing()
                .accounts({
                    listing: listingAccount,
                    marketplace: marketplace,
                    seller: this.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            const result = {
                success: true,
                listingId,
                signature: tx,
                message: 'Listing cancelled successfully'
            };
            
            Logger.logTransaction(tx, 'Cancel Listing', {
                listingId,
                seller: this.wallet.publicKey.toString()
            });
            
            Logger.logSuccess('Cancel Listing', result);
            return result;
        } catch (error) {
            Logger.logError('Cancel Listing', error);
            throw error;
        }
    }

    async getListings() {
        Logger.logStart('Get Listings');
        
        try {
            if (!this.program) {
                throw new Error('Anchor program not initialized');
            }

            // Get all listing accounts
            const listings = await this.program.account.listing.all();
            
            const result = {
                success: true,
                listings: listings.map((listing: any) => ({
                    id: listing.publicKey.toString(),
                    nftMint: listing.account.nftMint?.toString() || '',
                    seller: listing.account.seller?.toString() || '',
                    price: listing.account.price?.toString() || '0',
                    isActive: listing.account.isActive || false,
                })),
                message: 'Listings fetched successfully'
            };
            
            Logger.logSuccess('Get Listings', {
                count: result.listings.length,
                activeListings: result.listings.filter(l => l.isActive).length
            });
            
            return result;
        } catch (error) {
            Logger.logError('Get Listings', error);
            throw error;
        }
    }

    async transferNft(nftId: string, toAddress: string) {
        Logger.logStart('Transfer NFT', { nftId, toAddress });
        
        try {
            // Validate inputs
            const nftValidation = Config.validatePublicKey(nftId);
            if (!nftValidation.isValid) {
                throw new Error(`Invalid NFT ID: ${nftValidation.error}`);
            }
            
            const recipientValidation = Config.validatePublicKey(toAddress);
            if (!recipientValidation.isValid) {
                throw new Error(`Invalid recipient address: ${recipientValidation.error}`);
            }
            
            const nftMint = nftValidation.publicKey!;
            const recipient = recipientValidation.publicKey!;
            
            // Get sender's token account (current owner)
            const fromTokenAccount = await getAssociatedTokenAddress(
                nftMint,
                this.wallet.publicKey
            );
            
            // Get recipient's token account
            const toTokenAccount = await getAssociatedTokenAddress(
                nftMint,
                recipient
            );
            
            Logger.logAccount(fromTokenAccount.toString(), 'Sender Token Account');
            Logger.logAccount(toTokenAccount.toString(), 'Recipient Token Account');
            
            // Check if sender has the NFT
            try {
                const fromAccount = await getAccount(this.connection, fromTokenAccount);
                if (Number(fromAccount.amount) === 0) {
                    throw new Error('Sender does not own this NFT');
                }
                Logger.logSuccess('NFT Ownership Verification', {
                    owner: this.wallet.publicKey.toString(),
                    amount: fromAccount.amount.toString()
                });
            } catch (error) {
                if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
                    throw new Error('Sender does not have a token account for this NFT');
                }
                throw error;
            }
            
            // Create transaction
            const transaction = new Transaction();
            
            // Check if recipient's token account exists, if not create it
            try {
                await getAccount(this.connection, toTokenAccount);
                Logger.logSuccess('Recipient Token Account Check', 'Account already exists');
            } catch (error) {
                if (error instanceof TokenAccountNotFoundError) {
                    Logger.logStart('Creating Recipient Token Account');
                    
                    // Add instruction to create associated token account
                    const createAtaInstruction = createAssociatedTokenAccountInstruction(
                        this.wallet.publicKey, // payer
                        toTokenAccount,        // associated token account
                        recipient,             // owner
                        nftMint               // mint
                    );
                    
                    transaction.add(createAtaInstruction);
                    Logger.logSuccess('Added Create ATA Instruction');
                } else {
                    throw error;
                }
            }
            
            // Add transfer instruction
            const transferInstruction = createTransferInstruction(
                fromTokenAccount,     // source
                toTokenAccount,       // destination  
                this.wallet.publicKey, // owner
                1,                    // amount (NFTs are always 1)
                [],                   // multiSigners (empty for single signer)
                TOKEN_PROGRAM_ID      // program ID
            );
            
            transaction.add(transferInstruction);
            Logger.logSuccess('Added Transfer Instruction', {
                from: fromTokenAccount.toString(),
                to: toTokenAccount.toString(),
                amount: 1
            });
            
            // Set recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.wallet.publicKey;
            
            // Sign and send transaction
            transaction.sign(this.wallet);
            
            const signature = await this.connection.sendRawTransaction(
                transaction.serialize()
            );
            
            // Confirm transaction
            const confirmation = await this.connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight
            });
            
            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }
            
            const result = {
                success: true,
                nftId,
                toAddress,
                signature,
                fromTokenAccount: fromTokenAccount.toString(),
                toTokenAccount: toTokenAccount.toString(),
                message: 'NFT transferred successfully'
            };
            
            Logger.logTransaction(signature, 'Transfer NFT', {
                nftMint: nftId,
                from: this.wallet.publicKey.toString(),
                to: toAddress,
                fromTokenAccount: fromTokenAccount.toString(),
                toTokenAccount: toTokenAccount.toString()
            });
            
            Logger.logSuccess('Transfer NFT', result);
            return result;
        } catch (error) {
            Logger.logError('Transfer NFT', error);
            throw error;
        }
    }
}