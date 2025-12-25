export interface NftListing {
    id: string;
    creator: string;
    price: number;
    tokenMint: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Nft {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    creator: string;
    tokenMint: string;
}

export interface CreateListingRequest {
    price: number;
    tokenMint: string;
}

export interface BuyNftRequest {
    listingId: string;
}

export interface CancelListingRequest {
    listingId: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}