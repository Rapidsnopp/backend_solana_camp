import express from 'express';
import { json } from 'body-parser';
import { NftController } from './controllers/nft.controller';
import { MarketplaceController } from './controllers/marketplace.controller';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Solana NFT Marketplace Backend'
    });
});

// API Documentation
app.get('/', (req, res) => {
    console.log('GET /');
    res.json({
        service: 'Solana NFT Marketplace API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            nft: {
                details: 'GET /nft/:nftId',
                upload: 'POST /nft/upload',
                create: 'POST /nft/create',
                userNfts: 'GET /nft/user/:walletAddress',
                mint: 'POST /nft/mint',
                transfer: 'POST /nft/transfer'
            },
            marketplace: {
                listings: 'GET /marketplace/listings',
                userListings: 'GET /marketplace/user/:walletAddress/listings',
                createListing: 'POST /marketplace/listing',
                buyNft: 'POST /marketplace/buy/:listingId',
                cancelListing: 'DELETE /marketplace/cancel/:listingId'
            }
        }
    });
});

// Initialize controllers
let nftController: NftController;
let marketplaceController: MarketplaceController;

try {
    nftController = new NftController();
    marketplaceController = new MarketplaceController();
    console.log('✅ Controllers initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize controllers:', error);
    process.exit(1);
}

// NFT routes
app.get('/nft/:nftId', async (req, res) => {
    try {
        await nftController.getNftDetails(req, res);
    } catch (error) {
        console.error('Error in getNftDetails:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/nft/upload', async (req, res) => {
    try {
        await nftController.uploadImage(req, res);
    } catch (error) {
        console.error('Error in uploadImage:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/nft/create', async (req, res) => {
    try {
        await nftController.createNft(req, res);
    } catch (error) {
        console.error('Error in createNft:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/nft/user/:walletAddress', async (req, res) => {
    try {
        await nftController.getUserNfts(req, res);
    } catch (error) {
        console.error('Error in getUserNfts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/nft/mint', async (req, res) => {
    try {
        await nftController.mintNft(req, res);
    } catch (error) {
        console.error('Error in mintNft:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/nft/transfer', async (req, res) => {
    try {
        await nftController.transferNft(req, res);
    } catch (error) {
        console.error('Error in transferNft:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Marketplace routes
app.get('/marketplace/listings', async (req, res) => {
    try {
        console.log('GET /marketplace/listings');
        await marketplaceController.getListings(req, res);
    } catch (error) {
        console.error('Error in getListings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/marketplace/user/:walletAddress/listings', async (req, res) => {
    try {
        await marketplaceController.getUserListings(req, res);
    } catch (error) {
        console.error('Error in getUserListings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/marketplace/listing', async (req, res) => {
    try {
        await marketplaceController.createListing(req, res);
    } catch (error) {
        console.error('Error in createListing:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/marketplace/buy/:listingId', async (req, res) => {
    try {
        await marketplaceController.buyNft(req, res);
    } catch (error) {
        console.error('Error in buyNft:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/marketplace/cancel/:listingId', async (req, res) => {
    try {
        await marketplaceController.cancelListing(req, res);
    } catch (error) {
        console.error('Error in cancelListing:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generic route for marketplace base
app.get('/marketplace/', (req, res) => {
    console.log('GET /marketplace/');
    res.json({
        message: 'Solana NFT Marketplace API',
        availableEndpoints: [
            'GET /marketplace/listings',
            'GET /marketplace/user/:walletAddress/listings',
            'POST /marketplace/listing',
            'POST /marketplace/buy/:listingId',
            'DELETE /marketplace/cancel/:listingId'
        ]
    });
});

// Generic route for NFT base
app.get('/nft/', (req, res) => {
    console.log('GET /nft/');
    res.json({
        message: 'Solana NFT API',
        availableEndpoints: [
            'GET /nft/:nftId',
            'POST /nft/upload',
            'POST /nft/create',
            'GET /nft/user/:walletAddress',
            'POST /nft/mint',
            'POST /nft/transfer'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Server is running on http://localhost:' + PORT);
    console.log('📊 Health check: http://localhost:' + PORT + '/health');
    console.log('🎨 NFT endpoints: http://localhost:' + PORT + '/nft/');
    console.log('🏪 Marketplace endpoints: http://localhost:' + PORT + '/marketplace/');
});
