import { apiService } from './api.service';
import { NFT } from '../pages/Marketplace';

export interface CreateNFTRequest {
  name: string;
  description: string;
  image: File | string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  royalty: number;
  collection?: string;
  walletAddress: string;
}

export interface UploadResponse {
  url: string;
  ipfsHash: string;
}

class NFTService {
  async getUserNFTs(walletAddress: string) {
    return apiService.get<NFT[]>(`/nft/user/${walletAddress}`);
  }

  async getNFTById(nftId: string) {
    return apiService.get<NFT>(`/nft/${nftId}`);
  }

  async createNFT(data: CreateNFTRequest) {
    // If image is a File, we need to upload it first
    if (data.image instanceof File) {
      console.log('🖼️ Uploading image file:', data.image.name);
      try {
        const uploadedImage = await this.uploadImage(data.image);
        console.log('✅ Image uploaded:', uploadedImage);
        
        if (uploadedImage && uploadedImage.url) {
          data.image = uploadedImage.url;
        } else {
          console.error('❌ Upload response missing URL:', uploadedImage);
          throw new Error('Upload failed: no URL returned');
        }
      } catch (error) {
        console.error('❌ Image upload failed:', error);
        throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('🎨 Creating NFT with data:', data);
    return apiService.post<{
      nftAddress: string;
      transactionId: string;
      metadata: any;
    }>('/nft/create', data);
  }

  async uploadImage(file: File) {
    console.log('📤 Starting upload for file:', file.name, file.size, 'bytes');
    
    const formData = new FormData();
    formData.append('image', file);

    console.log('📤 Sending request to /api/nft/upload');
    const response = await fetch('/api/nft/upload', {
      method: 'POST',
      body: formData,
    });

    console.log('📤 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed with status:', response.status, errorText);
      throw new Error(`Failed to upload image: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('📤 Upload result:', result);
    return result as Promise<UploadResponse>;
  }

  async uploadMetadata(metadata: any) {
    return apiService.post<UploadResponse>('/nft/metadata', metadata);
  }

  async transferNFT(nftAddress: string, toAddress: string, fromAddress: string) {
    return apiService.post<{ transactionId: string }>('/nft/transfer', {
      nftAddress,
      toAddress,
      fromAddress
    });
  }

  async burnNFT(nftAddress: string, ownerAddress: string) {
    return apiService.post<{ transactionId: string }>('/nft/burn', {
      nftAddress,
      ownerAddress
    });
  }

  async updateNFTMetadata(nftAddress: string, metadata: any, ownerAddress: string) {
    return apiService.put<{ transactionId: string }>(`/nft/${nftAddress}/metadata`, {
      metadata,
      ownerAddress
    });
  }

  async verifyNFTOwnership(nftAddress: string, walletAddress: string) {
    return apiService.get<{ isOwner: boolean }>(`/nft/${nftAddress}/verify-owner/${walletAddress}`);
  }

  async getNFTHistory(nftAddress: string) {
    return apiService.get<Array<{
      type: 'mint' | 'transfer' | 'sale' | 'list' | 'cancel';
      from?: string;
      to?: string;
      price?: number;
      timestamp: string;
      transactionId: string;
    }>>(`/nft/${nftAddress}/history`);
  }

  async searchNFTs(query: string, filters?: {
    minPrice?: number;
    maxPrice?: number;
    collections?: string[];
    attributes?: Record<string, string[]>;
  }) {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters) {
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.collections?.length) params.append('collections', filters.collections.join(','));
      if (filters.attributes) params.append('attributes', JSON.stringify(filters.attributes));
    }

    return apiService.get<NFT[]>(`/nft/search?${params.toString()}`);
  }
}

export const nftService = new NFTService();
