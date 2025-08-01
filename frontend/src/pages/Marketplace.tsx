import { useState, useEffect } from 'react';
import { NFTCard, SearchBar, FilterSidebar, LoadingSpinner } from '../components';
import { useToast } from '../contexts';
import { marketplaceService } from '../services';

export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  seller: string;
  isListed: boolean;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  collection?: string;
  creator: string;
  royalty: number;
}

export interface MarketplaceFilters {
  priceRange: [number, number];
  collections: string[];
  attributes: Record<string, string[]>;
  sortBy: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'oldest';
}

export const Marketplace: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<MarketplaceFilters>({
    priceRange: [0, 1000],
    collections: [],
    attributes: {},
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadNFTs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [nfts, searchTerm, filters]);

  const loadNFTs = async () => {
    try {
      setLoading(true);
      const response = await marketplaceService.getListedNFTs();
      setNfts(response.data);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      addToast('Failed to load NFTs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...nfts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.collection?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price range filter
    filtered = filtered.filter(nft =>
      nft.price >= filters.priceRange[0] && nft.price <= filters.priceRange[1]
    );

    // Apply collection filter
    if (filters.collections.length > 0) {
      filtered = filtered.filter(nft =>
        nft.collection && filters.collections.includes(nft.collection)
      );
    }

    // Apply attribute filters
    Object.entries(filters.attributes).forEach(([traitType, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(nft =>
          nft.attributes?.some(attr =>
            attr.trait_type === traitType && values.includes(attr.value)
          )
        );
      }
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'newest':
        case 'oldest':
        default:
          return 0; // Would need timestamp for proper sorting
      }
    });

    setFilteredNfts(filtered);
  };

  const handlePurchase = async (nftId: string) => {
    try {
      await marketplaceService.buyNFT(nftId);
      addToast('NFT purchased successfully!', 'success');
      loadNFTs(); // Reload to update the list
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      addToast('Failed to purchase NFT', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <span className="gradient-text">NFT Marketplace</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Discover, collect, and sell extraordinary NFTs on Solana
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search NFTs, collections, or creators..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary lg:hidden"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Filters
          </button>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            {filteredNfts.length} NFT{filteredNfts.length !== 1 ? 's' : ''} found
          </p>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="input-field w-auto"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            collections={Array.from(new Set(nfts.map(nft => nft.collection).filter(Boolean) as string[]))}
            attributes={getUniqueAttributes(nfts)}
          />
        </div>

        {/* NFT Grid */}
        <div className="flex-1">
          {filteredNfts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    priceRange: [0, 1000],
                    collections: [],
                    attributes: {},
                    sortBy: 'newest'
                  });
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredNfts.map((nft) => (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                  onPurchase={handlePurchase}
                  showPrice={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to extract unique attributes from NFTs
const getUniqueAttributes = (nfts: NFT[]) => {
  const attributes: Record<string, Set<string>> = {};
  
  nfts.forEach(nft => {
    nft.attributes?.forEach(attr => {
      if (!attributes[attr.trait_type]) {
        attributes[attr.trait_type] = new Set();
      }
      attributes[attr.trait_type].add(attr.value);
    });
  });

  // Convert Sets to Arrays for easier handling
  const result: Record<string, string[]> = {};
  Object.entries(attributes).forEach(([key, valueSet]) => {
    result[key] = Array.from(valueSet);
  });

  return result;
};
