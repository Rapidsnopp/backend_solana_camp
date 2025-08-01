import { apiService } from './api.service';
import { NFT } from '../pages/Marketplace';

export interface CreateListingRequest {
  nftAddress: string;
  price: number;
  walletAddress: string;
}

export interface BuyNFTRequest {
  listingId: string;
  buyerWallet: string;
}

export interface ListingResponse {
  id: string;
  nftAddress: string;
  price: number;
  seller: string;
  isActive: boolean;
  createdAt: string;
  nft: NFT;
}

class MarketplaceService {
  async getListedNFTs() {
    return apiService.get<NFT[]>('/marketplace/listings');
  }

  async createListing(data: CreateListingRequest) {
    return apiService.post<ListingResponse>('/marketplace/listing', data);
  }

  async buyNFT(listingId: string) {
    return apiService.post<{ transactionId: string }>(`/marketplace/buy/${listingId}`);
  }

  async cancelListing(listingId: string) {
    return apiService.delete<{ success: boolean }>(`/marketplace/cancel/${listingId}`);
  }

  async getUserListings(walletAddress: string) {
    return apiService.get<ListingResponse[]>(`/marketplace/user/${walletAddress}/listings`);
  }

  async getListingById(listingId: string) {
    return apiService.get<ListingResponse>(`/marketplace/listing/${listingId}`);
  }

  async updateListingPrice(listingId: string, newPrice: number) {
    return apiService.put<ListingResponse>(`/marketplace/listing/${listingId}/price`, {
      price: newPrice
    });
  }

  async getMarketplaceStats() {
    return apiService.get<{
      totalListings: number;
      totalVolume: number;
      totalUsers: number;
      floorPrice: number;
    }>('/marketplace/stats');
  }
}

export const marketplaceService = new MarketplaceService();
