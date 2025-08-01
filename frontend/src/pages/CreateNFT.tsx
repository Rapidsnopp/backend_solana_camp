import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '../contexts';
import { nftService, CreateNFTRequest } from '../services';
import { LoadingSpinner } from '../components';

interface NFTAttribute {
  trait_type: string;
  value: string;
}

export const CreateNFT: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    royalty: 5,
    collection: ''
  });
  const [attributes, setAttributes] = useState<NFTAttribute[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { connected, publicKey } = useWallet();
  const { addToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'royalty' ? Math.min(10, Math.max(0, Number(value))) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addAttribute = () => {
    setAttributes(prev => [...prev, { trait_type: '', value: '' }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: keyof NFTAttribute, value: string) => {
    setAttributes(prev => prev.map((attr, i) => 
      i === index ? { ...attr, [field]: value } : attr
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      addToast('Please connect your wallet first', 'error');
      return;
    }

    if (!image) {
      addToast('Please select an image for your NFT', 'error');
      return;
    }

    if (!formData.name.trim()) {
      addToast('Please enter a name for your NFT', 'error');
      return;
    }

    try {
      setLoading(true);

      const validAttributes = attributes.filter(attr => 
        attr.trait_type.trim() && attr.value.trim()
      );

      const createRequest: CreateNFTRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image,
        attributes: validAttributes,
        royalty: formData.royalty,
        collection: formData.collection.trim() || undefined,
        walletAddress: publicKey.toString()
      };

      const response = await nftService.createNFT(createRequest);
      
      addToast('NFT created successfully!', 'success');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        royalty: 5,
        collection: ''
      });
      setAttributes([]);
      setImage(null);
      setImagePreview('');
      
      console.log('NFT created:', response);
      
    } catch (error) {
      console.error('Error creating NFT:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addToast(`Failed to create NFT: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            Please connect your Solana wallet to create and mint NFTs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Create <span className="gradient-text">NFT</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Mint your digital artwork as an NFT on Solana
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image Upload */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Upload Image</h3>
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="NFT Preview"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-solana-purple transition-colors">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-400 mb-2">Click to upload image</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Preview Info */}
            {imagePreview && (
              <div className="card">
                <h4 className="font-medium mb-2">Preview</h4>
                <p className="text-sm text-gray-400">
                  This is how your NFT will appear in the marketplace
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Form Fields */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter NFT name"
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your NFT"
                    rows={4}
                    className="input-field w-full resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Collection (Optional)</label>
                  <input
                    type="text"
                    name="collection"
                    value={formData.collection}
                    onChange={handleInputChange}
                    placeholder="Collection name"
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Royalty ({formData.royalty}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    name="royalty"
                    value={formData.royalty}
                    onChange={handleInputChange}
                    className="w-full accent-solana-purple"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Percentage you'll earn from future sales
                  </p>
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Attributes</h3>
                <button
                  type="button"
                  onClick={addAttribute}
                  className="btn-secondary text-sm"
                >
                  Add Trait
                </button>
              </div>

              <div className="space-y-3">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Trait type (e.g., Color)"
                      value={attr.trait_type}
                      onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                      className="input-field flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g., Blue)"
                      value={attr.value}
                      onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {attributes.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    No attributes added yet. Add traits to make your NFT unique!
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !image || !formData.name.trim()}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="small" className="mr-2" />
                  Creating NFT...
                </div>
              ) : (
                'Create NFT'
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By creating an NFT, you agree to our terms of service and confirm that you own the rights to the uploaded content.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
