import React from 'react';
import { MarketplaceFilters } from '../../pages/Marketplace';

interface FilterSidebarProps {
  filters: MarketplaceFilters;
  onFiltersChange: (filters: MarketplaceFilters) => void;
  collections: string[];
  attributes: Record<string, string[]>;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFiltersChange,
  collections,
  attributes
}) => {
  const updateFilters = (updates: Partial<MarketplaceFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleCollectionToggle = (collection: string) => {
    const newCollections = filters.collections.includes(collection)
      ? filters.collections.filter(c => c !== collection)
      : [...filters.collections, collection];
    updateFilters({ collections: newCollections });
  };

  const handleAttributeToggle = (traitType: string, value: string) => {
    const currentValues = filters.attributes[traitType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFilters({
      attributes: {
        ...filters.attributes,
        [traitType]: newValues
      }
    });
  };

  const clearAllFilters = () => {
    updateFilters({
      priceRange: [0, 1000],
      collections: [],
      attributes: {},
      sortBy: 'newest'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-solana-purple hover:text-purple-400 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Price Range */}
      <div className="card">
        <h4 className="font-medium mb-3">Price Range (SOL)</h4>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange[0]}
              onChange={(e) => updateFilters({
                priceRange: [Number(e.target.value) || 0, filters.priceRange[1]]
              })}
              className="input-field flex-1"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange[1]}
              onChange={(e) => updateFilters({
                priceRange: [filters.priceRange[0], Number(e.target.value) || 1000]
              })}
              className="input-field flex-1"
            />
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.priceRange[1]}
            onChange={(e) => updateFilters({
              priceRange: [filters.priceRange[0], Number(e.target.value)]
            })}
            className="w-full accent-solana-purple"
          />
        </div>
      </div>

      {/* Collections */}
      {collections.length > 0 && (
        <div className="card">
          <h4 className="font-medium mb-3">Collections</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {collections.map((collection) => (
              <label key={collection} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.collections.includes(collection)}
                  onChange={() => handleCollectionToggle(collection)}
                  className="rounded border-gray-600 text-solana-purple focus:ring-solana-purple focus:ring-2"
                />
                <span className="text-sm">{collection}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Attributes */}
      {Object.entries(attributes).map(([traitType, values]) => (
        <div key={traitType} className="card">
          <h4 className="font-medium mb-3 capitalize">{traitType.replace('_', ' ')}</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {values.map((value) => (
              <label key={value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.attributes[traitType]?.includes(value) || false}
                  onChange={() => handleAttributeToggle(traitType, value)}
                  className="rounded border-gray-600 text-solana-purple focus:ring-solana-purple focus:ring-2"
                />
                <span className="text-sm">{value}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Status */}
      <div className="card">
        <h4 className="font-medium mb-3">Status</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-600 text-solana-purple focus:ring-solana-purple focus:ring-2"
            />
            <span className="text-sm">Buy Now</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-600 text-solana-purple focus:ring-solana-purple focus:ring-2"
            />
            <span className="text-sm">On Auction</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-600 text-solana-purple focus:ring-solana-purple focus:ring-2"
            />
            <span className="text-sm">New</span>
          </label>
        </div>
      </div>
    </div>
  );
};
