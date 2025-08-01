import { SolanaService } from './services/solana.service';
import { Config } from './config/config';
import { Logger } from './utils/logger';

async function testBasicFunctionality() {
    console.log('🧪 Starting Solana NFT Marketplace Tests...\n');
    
    try {
        // Test 1: Initialize SolanaService
        console.log('=== Test 1: Service Initialization ===');
        const solanaService = new SolanaService();
        
        console.log(`✅ SolanaService initialized`);
        console.log(`🌐 Network: ${Config.CLUSTER}`);
        console.log(`🔗 RPC URL: ${Config.CLUSTER_URL}`);
        console.log(`📋 Program ID: ${Config.PROGRAM_ID.toString()}\n`);
        
        // Test 2: Validate Public Keys
        console.log('=== Test 2: Public Key Validation ===');
        const testKeys = [
            '11111111111111111111111111111112', // Valid system program
            'So11111111111111111111111111111111111111112', // Valid wrapped SOL
            'invalid_key', // Invalid
            '', // Empty
        ];
        
        testKeys.forEach(key => {
            const validation = Config.validatePublicKey(key);
            console.log(`Key: ${key.substring(0, 20)}... → ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
            if (!validation.isValid) {
                console.log(`   Error: ${validation.error}`);
            }
        });
        console.log();
        
        // Test 3: Test Logger
        console.log('=== Test 3: Logger Functions ===');
        Logger.logStart('Test Operation', { param1: 'value1', param2: 'value2' });
        Logger.logSuccess('Test Operation', { result: 'success' });
        
        // Test 4: Test Connection
        console.log('=== Test 4: Connection Test ===');
        const connection = solanaService.getConnection();
        const slot = await connection.getSlot();
        console.log(`✅ Connected to Solana`);
        console.log(`📊 Current slot: ${slot}\n`);
        
        // Test 5: Test Account Info (using system program)
        console.log('=== Test 5: Account Info Test ===');
        const systemProgramId = '11111111111111111111111111111112';
        const accountInfo = await solanaService.getAccountInfo(systemProgramId);
        console.log(`✅ Retrieved account info for system program`);
        console.log(`📦 Account data length: ${accountInfo?.data.length || 0} bytes\n`);
        
        // Test 6: Test Wallet
        console.log('=== Test 6: Wallet Info ===');
        const wallet = solanaService.getWallet();
        console.log(`💰 Wallet Address: ${wallet.publicKey.toString()}`);
        console.log(`🔗 Explorer: ${Config.getAccountExplorerUrl(wallet.publicKey.toString())}\n`);
        
        // Test 7: Check wallet balance
        console.log('=== Test 7: Wallet Balance ===');
        const balance = await connection.getBalance(wallet.publicKey);
        const balanceSOL = balance / 1_000_000_000; // Convert lamports to SOL
        console.log(`💰 Balance: ${balance} lamports (${balanceSOL.toFixed(4)} SOL)`);
        
        if (balanceSOL === 0) {
            console.log('⚠️  Warning: Wallet has 0 SOL balance');
            console.log('   You need SOL to pay for transactions');
            if (Config.CLUSTER === 'devnet') {
                console.log('   Get devnet SOL: https://faucet.solana.com/');
            }
        }
        console.log();
        
        // Test 8: Test Error Handling
        console.log('=== Test 8: Error Handling Test ===');
        try {
            await solanaService.transferNft('invalid_nft', 'invalid_address');
        } catch (error) {
            console.log('✅ Error handling works correctly');
            console.log(`   Caught expected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        console.log();
        
        console.log('🎉 All tests completed successfully!');
        console.log('\n📝 Next Steps:');
        console.log('1. Fund your wallet with SOL if balance is 0');
        console.log('2. Deploy your Anchor program');
        console.log('3. Update Config.PROGRAM_ID with your deployed program ID');
        console.log('4. Replace MARKETPLACE_IDL with your actual IDL');
        console.log('5. Start the server with: npm start');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run tests
testBasicFunctionality().catch(console.error);
