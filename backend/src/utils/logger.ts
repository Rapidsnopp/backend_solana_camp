import { Config } from '../config/config';

export class Logger {
    /**
     * Log transaction details with explorer link
     */
    public static logTransaction(signature: string, operation: string, details?: any) {
        const explorerUrl = Config.getTransactionExplorerUrl(signature);
        
        console.log(`\n🔗 Transaction ${operation}:`);
        console.log(`   Signature: ${signature}`);
        console.log(`   Explorer: ${explorerUrl}`);
        
        if (details) {
            console.log(`   Details:`, JSON.stringify(details, null, 2));
        }
        
        console.log(''); // Empty line for readability
    }
    
    /**
     * Log account details with explorer link
     */
    public static logAccount(publicKey: string, accountType: string, details?: any) {
        const explorerUrl = Config.getAccountExplorerUrl(publicKey);
        
        console.log(`\n👤 ${accountType} Account:`);
        console.log(`   Address: ${publicKey}`);
        console.log(`   Explorer: ${explorerUrl}`);
        
        if (details) {
            console.log(`   Details:`, JSON.stringify(details, null, 2));
        }
        
        console.log(''); // Empty line for readability
    }
    
    /**
     * Log operation start
     */
    public static logStart(operation: string, params?: any) {
        console.log(`\n🚀 Starting ${operation}...`);
        if (params) {
            console.log(`   Parameters:`, JSON.stringify(params, null, 2));
        }
    }
    
    /**
     * Log operation success
     */
    public static logSuccess(operation: string, result?: any) {
        console.log(`\n✅ ${operation} completed successfully`);
        if (result) {
            console.log(`   Result:`, JSON.stringify(result, null, 2));
        }
    }
    
    /**
     * Log operation error
     */
    public static logError(operation: string, error: any) {
        console.error(`\n❌ ${operation} failed:`);
        console.error(`   Error:`, error instanceof Error ? error.message : error);
        if (error instanceof Error && error.stack) {
            console.error(`   Stack:`, error.stack);
        }
    }
    
    /**
     * Log wallet information
     */
    public static logWallet(wallet: { publicKey: { toString(): string } }, walletType: string) {
        const address = wallet.publicKey.toString();
        const explorerUrl = Config.getAccountExplorerUrl(address);
        
        console.log(`\n💰 ${walletType} Wallet:`);
        console.log(`   Address: ${address}`);
        console.log(`   Explorer: ${explorerUrl}`);
        console.log('');
    }
}
