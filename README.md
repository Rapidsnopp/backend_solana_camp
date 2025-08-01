# Solana NFT Marketplace

This project is a decentralized NFT marketplace built on the Solana blockchain using the Metaplex protocol. It allows users to create, buy, and manage NFT listings in a secure and efficient manner.

## Project Structure

```
solana-nft-marketplace
├── programs
│   └── marketplace
│       ├── src
│       │   ├── lib.rs               # Main library file for the Solana smart contract
│       │   ├── instructions          # Contains various smart contract instructions
│       │   │   ├── mod.rs            # Module for instructions
│       │   │   ├── create_listing.rs  # Instruction for creating a new NFT listing
│       │   │   ├── buy_nft.rs        # Instruction for purchasing an NFT
│       │   │   └── cancel_listing.rs  # Instruction for canceling an NFT listing
│       │   └── state                 # Manages the state of the smart contract
│       │       ├── mod.rs            # Module for state management
│       │       └── marketplace.rs     # Data structures for the marketplace
│       └── Cargo.toml                # Rust project configuration
├── backend
│   ├── src
│   │   ├── main.ts                   # Entry point for the backend application
│   │   ├── controllers               # Contains controllers for handling requests
│   │   │   ├── nft.controller.ts      # Handles NFT-related requests
│   │   │   └── marketplace.controller.ts # Handles marketplace-related requests
│   │   ├── services                  # Contains services for blockchain interactions
│   │   │   ├── solana.service.ts      # Interacts with the Solana blockchain
│   │   │   └── metaplex.service.ts    # Interacts with the Metaplex protocol
│   │   └── types                     # Contains TypeScript types and interfaces
│   │       └── index.ts              # Exports types used throughout the backend
│   ├── package.json                  # npm configuration for the backend
│   └── tsconfig.json                 # TypeScript configuration for the backend
├── tests
│   ├── marketplace.test.ts           # Test cases for marketplace functionality
│   └── utils.ts                      # Utility functions for tests
├── Anchor.toml                       # Anchor framework configuration
├── package.json                      # Root-level npm configuration
└── README.md                         # Project documentation
```

## Getting Started

### Prerequisites

- Node.js and npm
- Rust and Cargo
- Solana CLI
- Anchor framework

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd solana-nft-marketplace
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Build the Solana program:
   ```
   cd programs/marketplace
   cargo build
   ```

### Usage

- Start the backend server:
  ```
  cd backend
  npm start
  ```

- Interact with the NFT marketplace through the provided API endpoints.

### Testing

Run the tests for the marketplace functionality:
```
cd tests
npm test
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.