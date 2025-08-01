# Solana NFT Marketplace Backend

## 🚀 Khởi chạy

```bash
# Cài đặt dependencies
npm install

# Chạy server
npm start

# Chạy test cơ bản
npm run test:basic

# Chạy trong development mode (auto-reload)
npm run dev
```

## 📚 API Endpoints

### Base URL: `http://localhost:3000`

### 🏠 General Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API documentation |
| GET | `/health` | Health check |
| GET | `/marketplace` | Marketplace endpoints info |
| GET | `/nft` | NFT endpoints info |

### 🎨 NFT Endpoints

#### Get NFT Details
```http
GET /nft/:nftId
```

#### Mint NFT
```http
POST /nft/mint
Content-Type: application/json

{
  "metadata": {
    "name": "My NFT",
    "symbol": "MNFT", 
    "uri": "https://example.com/metadata.json",
    "sellerFeeBasisPoints": 500,
    "creators": [
      {
        "address": "CREATOR_PUBLIC_KEY",
        "share": 100
      }
    ]
  }
}
```

#### Transfer NFT
```http
POST /nft/transfer
Content-Type: application/json

{
  "nftId": "NFT_MINT_ADDRESS",
  "toAddress": "RECIPIENT_PUBLIC_KEY"
}
```

### 🏪 Marketplace Endpoints

#### Get All Listings
```http
GET /marketplace/listings
```

#### Create Listing
```http
POST /marketplace/listing
Content-Type: application/json

{
  "nftId": "NFT_MINT_ADDRESS",
  "price": 1.5
}
```

#### Buy NFT
```http
POST /marketplace/buy/:listingId
```

#### Cancel Listing
```http
DELETE /marketplace/listing/:listingId
```

## 🛠️ Configuration

### Environment Setup

1. **Network Configuration** (`src/config/config.ts`):
```typescript
// Change network
public static readonly CLUSTER: ClusterType = 'devnet'; // or 'mainnet-beta'
```

2. **Program ID** (Required):
```typescript
// Replace with your deployed program ID
public static readonly PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID');
```

3. **Wallet Setup**:
   - Place your wallet file in project root as `wallet.json`
   - Or use Solana CLI default: `~/.config/solana/id.json`
   - System will auto-generate dev wallet if none found

### 💰 Funding Your Wallet

For **devnet**:
```bash
# Get devnet SOL
curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1, "method":"requestAirdrop", "params":["YOUR_WALLET_ADDRESS", 2000000000]}' https://api.devnet.solana.com
```

Or visit: https://faucet.solana.com/

## 🧪 Testing

### Test Server Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Get API documentation
curl http://localhost:3000/

# Get marketplace listings
curl http://localhost:3000/marketplace/listings

# Mint NFT
curl -X POST http://localhost:3000/nft/mint \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "name": "Test NFT",
      "symbol": "TEST",
      "uri": "https://example.com/nft.json",
      "sellerFeeBasisPoints": 500
    }
  }'
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.ts          # Main configuration
│   │   └── marketplace.ts     # IDL and types
│   ├── controllers/
│   │   ├── marketplace.controller.ts
│   │   └── nft.controller.ts
│   ├── services/
│   │   ├── solana.service.ts
│   │   └── metaplex.service.ts
│   ├── utils/
│   │   └── logger.ts          # Logging utilities
│   ├── main.ts               # Server entry point
│   └── test.ts              # Basic tests
├── package.json
└── README.md
```

## 🔧 Common Issues

### "Cannot GET /marketplace/"
✅ **Fixed!** Now returns helpful API documentation

### "Anchor program not initialized"
- Deploy your Anchor program first
- Update `Config.PROGRAM_ID` with deployed program ID
- Replace `MARKETPLACE_IDL` with actual IDL

### "Insufficient funds"
- Fund your wallet with SOL
- Use devnet faucet for testing

### "Invalid public key"
- Check address format (base58, 32-44 characters)
- Ensure addresses are valid Solana public keys

## 🌟 Features

- ✅ Complete NFT minting with Metaplex
- ✅ SPL token transfers
- ✅ Marketplace functionality (create/buy/cancel listings)
- ✅ Input validation
- ✅ Detailed logging with explorer links
- ✅ Error handling
- ✅ API documentation
- ✅ CORS support
- ✅ Health checks
