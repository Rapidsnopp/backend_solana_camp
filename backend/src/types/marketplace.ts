// Marketplace IDL types
export type MarketplaceListing = {
  nftMint: string;
  seller: string;
  price: string;
  isActive: boolean;
};

// Cluster types
export type ClusterType = 'devnet' | 'testnet' | 'mainnet-beta';

// Placeholder IDL structure - replace with your actual IDL
export const MARKETPLACE_IDL = {
  "version": "0.1.0",
  "name": "marketplace",
  "instructions": [
    {
      "name": "createListing",
      "accounts": [
        { "name": "listing", "isMut": true, "isSigner": true },
        { "name": "marketplace", "isMut": false, "isSigner": false },
        { "name": "nftMint", "isMut": false, "isSigner": false },
        { "name": "seller", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "price", "type": "u64" }
      ]
    },
    {
      "name": "buyNft",
      "accounts": [
        { "name": "listing", "isMut": true, "isSigner": false },
        { "name": "marketplace", "isMut": false, "isSigner": false },
        { "name": "nftMint", "isMut": false, "isSigner": false },
        { "name": "buyer", "isMut": true, "isSigner": true },
        { "name": "seller", "isMut": true, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "cancelListing",
      "accounts": [
        { "name": "listing", "isMut": true, "isSigner": false },
        { "name": "marketplace", "isMut": false, "isSigner": false },
        { "name": "seller", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Listing",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "nftMint", "type": "publicKey" },
          { "name": "seller", "type": "publicKey" },
          { "name": "price", "type": "u64" },
          { "name": "isActive", "type": "bool" }
        ]
      }
    }
  ]
};
