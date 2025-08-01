import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
import { MARKETPLACE_IDL, ClusterType } from '../types/marketplace';
import * as fs from 'fs';
import * as path from 'path';

export class Config {
    // Network configuration
    public static readonly CLUSTER: ClusterType = 'devnet'; // 'devnet' | 'testnet' | 'mainnet-beta'
    public static readonly CLUSTER_URL = clusterApiUrl(Config.CLUSTER);
    
    // Program configuration
    // TODO: Replace with your actual deployed program ID
    public static readonly PROGRAM_ID = new PublicKey('11111111111111111111111111111112');
    
    // IDL
    public static readonly IDL = MARKETPLACE_IDL;
    
    // Explorer URLs
    public static readonly EXPLORER_BASE_URL = Config.CLUSTER === 'mainnet-beta' 
        ? 'https://solscan.io' 
        : `https://solscan.io/?cluster=${Config.CLUSTER}`;
    
    /**
     * Load wallet from file or generate new one for development
     */
    public static loadWalletFromFile(walletPath?: string): Keypair {
        try {
            // Try to load from file first
            if (walletPath && fs.existsSync(walletPath)) {
                console.log(`Loading wallet from: ${walletPath}`);
                const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
                return Keypair.fromSecretKey(new Uint8Array(walletData));
            }
            
            // Try to load from default locations
            const defaultPaths = [
                path.join(process.env.HOME || '', '.config/solana/id.json'),
                path.join(process.cwd(), 'wallet.json'),
                path.join(process.cwd(), 'keypair.json')
            ];
            
            for (const defaultPath of defaultPaths) {
                if (fs.existsSync(defaultPath)) {
                    console.log(`Loading wallet from default location: ${defaultPath}`);
                    const walletData = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
                    return Keypair.fromSecretKey(new Uint8Array(walletData));
                }
            }
            
            // Generate new wallet for development
            console.warn('No wallet file found, generating new development wallet');
            const newWallet = Keypair.generate();
            
            // Save development wallet for reuse
            const devWalletPath = path.join(process.cwd(), 'dev-wallet.json');
            fs.writeFileSync(devWalletPath, JSON.stringify(Array.from(newWallet.secretKey)));
            console.log(`Development wallet saved to: ${devWalletPath}`);
            console.log(`Public key: ${newWallet.publicKey.toString()}`);
            
            return newWallet;
        } catch (error) {
            console.error('Error loading wallet:', error);
            console.log('Falling back to generated wallet');
            return Keypair.generate();
        }
    }
    
    /**
     * Validate if a string is a valid Solana public key
     */
    public static validatePublicKey(publicKeyString: string): { isValid: boolean; publicKey?: PublicKey; error?: string } {
        try {
            if (!publicKeyString || typeof publicKeyString !== 'string') {
                return { isValid: false, error: 'Public key must be a non-empty string' };
            }
            
            if (publicKeyString.length < 32 || publicKeyString.length > 44) {
                return { isValid: false, error: 'Invalid public key length' };
            }
            
            const publicKey = new PublicKey(publicKeyString);
            
            // Additional validation - check if it's not a system program
            if (publicKey.equals(PublicKey.default)) {
                return { isValid: false, error: 'Invalid public key: cannot be default public key' };
            }
            
            return { isValid: true, publicKey };
        } catch (error) {
            return { 
                isValid: false, 
                error: `Invalid public key format: ${error instanceof Error ? error.message : 'Unknown error'}` 
            };
        }
    }
    
    /**
     * Get explorer URL for transaction
     */
    public static getTransactionExplorerUrl(signature: string): string {
        return `${Config.EXPLORER_BASE_URL}/tx/${signature}`;
    }
    
    /**
     * Get explorer URL for account
     */
    public static getAccountExplorerUrl(publicKey: string): string {
        return `${Config.EXPLORER_BASE_URL}/account/${publicKey}`;
    }
    
    /**
     * Create connection with retry logic
     */
    public static createConnection(): Connection {
        return new Connection(Config.CLUSTER_URL, {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: 60000,
        });
    }
}

// Environment validation
if (Config.CLUSTER === 'mainnet-beta') {
    console.warn('⚠️  RUNNING ON MAINNET - Real SOL will be used!');
} else {
    console.log(`🔧 Running on ${Config.CLUSTER}`);
}
