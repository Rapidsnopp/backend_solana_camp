import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { NftController } from './controllers/nft.controller';
import { MarketplaceController } from './controllers/marketplace.controller';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(json());

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
    logger.info('GET /');
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

// Initialize controllers with error handling
let nftController: NftController;
let marketplaceController: MarketplaceController;

try {
    nftController = new NftController();
    marketplaceController = new MarketplaceController();
    console.log('✅ Controllers initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize controllers:', error);
    process.exit(1);
} NftController } from './controllers/nft.controller';
import { MarketplaceController } from './controllers/marketplace.controller';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(json());

// CORS middleware (for browser requests)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Initialize controllers with error handling
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

// NFT routes with error handling
app.get('/nft/:nftId', async (req, res) => {
    try {
        await nftController.getNftDetails(req, res);
    } catch (error) {
        console.error('Error in getNftDetails:', error);
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

// Marketplace routes with error handling
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

app.delete('/marketplace/listing/:listingId', async (req, res) => {
    try {
        await marketplaceController.cancelListing(req, res);
    } catch (error) {
        console.error('Error in cancelListing:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/marketplace/listings', async (req, res) => {
    try {
        await marketplaceController.getListings(req, res);
    } catch (error) {
        console.error('Error in getListings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Solana NFT Marketplace Backend'
    });
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
    res.json({
        message: 'Solana NFT Marketplace API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            nft: {
                getNftDetails: 'GET /nft/:nftId',
                mintNft: 'POST /nft/mint',
                transferNft: 'POST /nft/transfer'
            },
            marketplace: {
                createListing: 'POST /marketplace/listing',
                buyNft: 'POST /marketplace/buy/:listingId',
                cancelListing: 'DELETE /marketplace/listing/:listingId',
                getListings: 'GET /marketplace/listings'
            }
        },
        examples: {
            healthCheck: `${req.protocol}://${req.get('host')}/health`,
            getListings: `${req.protocol}://${req.get('host')}/marketplace/listings`,
            mintNft: `${req.protocol}://${req.get('host')}/nft/mint`
        }
    });
});

// Marketplace root endpoint
app.get('/marketplace', (req, res) => {
    res.json({
        message: 'Marketplace API',
        availableEndpoints: {
            createListing: 'POST /marketplace/listing',
            buyNft: 'POST /marketplace/buy/:listingId',
            cancelListing: 'DELETE /marketplace/listing/:listingId',
            getListings: 'GET /marketplace/listings'
        },
        examples: {
            createListing: {
                method: 'POST',
                url: `${req.protocol}://${req.get('host')}/marketplace/listing`,
                body: {
                    nftId: 'NFT_MINT_ADDRESS',
                    price: 1.5
                }
            },
            getListings: {
                method: 'GET',
                url: `${req.protocol}://${req.get('host')}/marketplace/listings`
            }
        }
    });
});

// NFT root endpoint
app.get('/nft', (req, res) => {
    res.json({
        message: 'NFT API',
        availableEndpoints: {
            getNftDetails: 'GET /nft/:nftId',
            mintNft: 'POST /nft/mint',
            transferNft: 'POST /nft/transfer'
        },
        examples: {
            getNftDetails: {
                method: 'GET',
                url: `${req.protocol}://${req.get('host')}/nft/YOUR_NFT_ID`
            },
            mintNft: {
                method: 'POST',
                url: `${req.protocol}://${req.get('host')}/nft/mint`,
                body: {
                    metadata: {
                        name: 'My NFT',
                        symbol: 'MNFT',
                        uri: 'https://example.com/metadata.json',
                        sellerFeeBasisPoints: 500
                    }
                }
            }
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableEndpoints: {
            root: 'GET /',
            health: 'GET /health',
            marketplace: 'GET /marketplace',
            nft: 'GET /nft'
        }
    });
});

app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🎨 NFT endpoints: http://localhost:${port}/nft/`);
    console.log(`🏪 Marketplace endpoints: http://localhost:${port}/marketplace/`);
});