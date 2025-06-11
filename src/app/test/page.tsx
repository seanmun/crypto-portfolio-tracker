'use client';

import { useState, useEffect } from 'react';
import { EthereumHandler } from '@/chains/ethereum';
import { PulsechainHandler } from '@/chains/pulsechain';
import { BitcoinHandler } from '@/chains/bitcoin';
import { Asset } from '@/types';

/**
 * HEX-Focused Test Page for Blockchain Integrations
 * 
 * Tests our tri-chain architecture:
 * - Bitcoin: BTC + Ordinals
 * - Ethereum: ETH + ERC-20 + NFTs  
 * - Pulsechain: PLS + HEX + PRC-20 (HEX ecosystem focus)
 */

export default function TestPage() {
  const [ethAssets, setEthAssets] = useState<Asset[]>([]);
  const [plsAssets, setPlsAssets] = useState<Asset[]>([]);
  const [btcAssets, setBtcAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test wallets from environment variables
  const testEthWallet = process.env.NEXT_PUBLIC_TEST_ETH_WALLET;
  const testBtcWallet = process.env.NEXT_PUBLIC_TEST_BTC_WALLET;
  const testPlsWallet = testEthWallet; // Same address for EVM chains

  const fetchEthereumData = async () => {
    if (!testEthWallet) return;
    
    try {
      const ethHandler = new EthereumHandler();
      const result = await ethHandler.getAllAssets(testEthWallet);
      
      if (result.success && result.data) {
        setEthAssets(result.data);
        console.log('📊 Ethereum assets loaded:', result.data);
      }
    } catch (err) {
      console.error('Ethereum fetch error:', err);
    }
  };

  const fetchPulsechainData = async () => {
    if (!testPlsWallet) return;
    
    try {
      const plsHandler = new PulsechainHandler();
      const result = await plsHandler.getAllAssets(testPlsWallet);
      
      if (result.success && result.data) {
        setPlsAssets(result.data);
        console.log('🔮 Pulsechain assets loaded:', result.data);
      }
    } catch (err) {
      console.error('Pulsechain fetch error:', err);
    }
  };

  const fetchBitcoinData = async () => {
    if (!testBtcWallet) {
      setError('No test BTC wallet found in environment variables');
      return;
    }
    
    try {
      const btcHandler = new BitcoinHandler();
      const result = await btcHandler.getAllAssets(testBtcWallet);
      
      if (result.success && result.data) {
        setBtcAssets(result.data);
        console.log('🟠 Bitcoin assets loaded:', result.data);
      } else {
        setError(result.error || 'Failed to fetch Bitcoin assets');
      }
    } catch (err) {
      setError(`Bitcoin error: ${err}`);
      console.error('Bitcoin fetch error:', err);
    }
  };

  const fetchAllChains = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all three chains simultaneously
      await Promise.all([
        fetchEthereumData(),
        fetchPulsechainData(),
        fetchBitcoinData()
      ]);
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch on component mount if we have test wallets
    if (testEthWallet || testBtcWallet) {
      fetchAllChains();
    }
  }, [testEthWallet, testBtcWallet]);

  const totalAssets = ethAssets.length + plsAssets.length + btcAssets.length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
          🚀 Tri-Chain Portfolio Tracker
        </h1>
        <p className="text-gray-600 mb-4">
          Testing Bitcoin + Ethereum + Pulsechain integrations for the ultimate HEX-focused tracker
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {testEthWallet && (
            <div className="bg-gradient-to-r from-blue-50 to-pink-50 border border-pink-200 p-4 rounded-lg">
              <p className="text-sm">
                <strong>EVM Wallet:</strong> {testEthWallet.slice(0, 8)}...{testEthWallet.slice(-6)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Used for Ethereum & Pulsechain (EVM compatible)
              </p>
            </div>
          )}
          
          {testBtcWallet && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Bitcoin Wallet:</strong> {testBtcWallet.slice(0, 8)}...{testBtcWallet.slice(-6)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Bitcoin mainnet address
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🎯 Tri-Chain Controls</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={fetchBitcoinData}
            disabled={isLoading || !testBtcWallet}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? '⏳' : '🟠'} Bitcoin
          </button>
          
          <button
            onClick={fetchEthereumData}
            disabled={isLoading || !testEthWallet}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? '⏳' : '🔵'} Ethereum
          </button>
          
          <button
            onClick={fetchPulsechainData}
            disabled={isLoading || !testPlsWallet}
            className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? '⏳' : '🔮'} Pulsechain
          </button>
          
          <button
            onClick={fetchAllChains}
            disabled={isLoading || (!testEthWallet && !testBtcWallet)}
            className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? '⏳ Loading...' : '🚀 Fetch All Chains'}
          </button>
          
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              {totalAssets}
            </div>
            <div className="text-sm text-gray-500">Total Assets</div>
          </div>
        </div>
        
        {(!testEthWallet || !testBtcWallet) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Missing wallets:</strong> Add {!testEthWallet && 'TEST_ETH_WALLET'} {!testBtcWallet && 'TEST_BTC_WALLET'} to your .env.local file
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-medium mb-2">❌ Error</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Assets Display Grid */}
      <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
        {/* Bitcoin Assets */}
        {btcAssets.length > 0 && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
              Bitcoin Assets ({btcAssets.length})
            </h2>
            <AssetGrid assets={btcAssets} chainColor="orange" />
          </div>
        )}

        {/* Ethereum Assets */}
        {ethAssets.length > 0 && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
              Ethereum Assets ({ethAssets.length})
            </h2>
            <AssetGrid assets={ethAssets} chainColor="blue" />
          </div>
        )}

        {/* Pulsechain Assets */}
        {plsAssets.length > 0 && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="w-4 h-4 bg-pink-500 rounded-full mr-3"></div>
              Pulsechain Assets ({plsAssets.length})
            </h2>
            <AssetGrid assets={plsAssets} chainColor="pink" />
          </div>
        )}
      </div>

      {/* Development Progress */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-pink-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4 text-lg">🔥 HEX Portfolio Tracker Progress</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-medium mb-3 text-green-700">✅ Foundation Complete</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Bitcoin: BTC balance detection</li>
              <li>• Ethereum: ETH + ERC-20 + NFTs</li>
              <li>• Pulsechain: PLS + HEX + PRC-20</li>
              <li>• Multi-chain architecture</li>
              <li>• HEX-focused branding</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-blue-700">🔄 Coming Next</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• HEX staking detection (T-Shares)</li>
              <li>• Interest calculations</li>
              <li>• Stake maturity tracking</li>
              <li>• Hexagon UI components</li>
              <li>• Bitcoin Ordinals</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-purple-700">🚀 Future Features</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Price tracking & USD values</li>
              <li>• Portfolio analytics</li>
              <li>• Stake optimization</li>
              <li>• Mobile app</li>
              <li>• Community sharing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable component for displaying assets
function AssetGrid({ assets, chainColor }: { assets: Asset[], chainColor: string }) {
  const [showAllNFTs, setShowAllNFTs] = useState(false);
  
  // Separate NFTs from other assets for better organization
  const regularAssets = assets.filter(asset => asset.type !== 'nft');
  const nftAssets = assets.filter(asset => asset.type === 'nft');
  
  // Control how many NFTs to show
  const nftsToShow = showAllNFTs ? nftAssets : nftAssets.slice(0, 12);

  return (
    <div className="space-y-6">
      {/* Regular Assets (tokens, native) */}
      {regularAssets.length > 0 && (
        <div className="space-y-3">
          {regularAssets.map((asset) => (
            <div key={asset.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div>
                      <h3 className="font-medium flex items-center">
                        {asset.symbol === 'HEX' && '🔥'}
                        {asset.symbol === 'BTC' && '🟠'}
                        {asset.symbol === 'ETH' && '🔵'}
                        {asset.symbol === 'PLS' && '🔮'}
                        {' '}{asset.name}
                        {asset.symbol === 'HEX' && (
                          <span className="ml-2 px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded-full">
                            HEX
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-500 text-sm">{asset.symbol}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 capitalize">{asset.type}</span>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Balance:</span>
                      <span className="ml-2 font-mono font-semibold">{asset.balanceFormatted}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NFTs Grid */}
      {nftAssets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">
              🖼️ NFTs ({nftAssets.length})
            </h4>
            {nftAssets.length > 12 && (
              <span className="text-xs text-gray-500">
                {showAllNFTs ? `Showing all ${nftAssets.length}` : 'Showing first 12'}
              </span>
            )}
          </div>
          
          {/* NFT Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {nftsToShow.map((nft) => (
              <div key={nft.id} className="group relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border hover:border-gray-300 transition-colors">
                  {nft.imageUrl ? (
                    <div className="relative w-full h-full">
                      {/* Special handling for different content types */}
                      {nft.contentType?.includes('html') || nft.collectionName?.toLowerCase().includes('quantum cat') ? (
                        // For HTML content like Quantum Cats - use iframe or preview
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center justify-center text-xs text-center p-2">
                          <div className="text-lg mb-1">🐱⚡</div>
                          <div className="font-medium">Interactive</div>
                          <div className="text-gray-600">HTML Content</div>
                        </div>
                      ) : nft.contentType?.includes('text') ? (
                        // For text inscriptions
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-gray-100 flex flex-col items-center justify-center text-xs text-center p-2">
                          <div className="text-lg mb-1">📝</div>
                          <div className="font-medium">Text</div>
                          <div className="text-gray-600">Inscription</div>
                        </div>
                      ) : nft.contentType?.includes('svg') ? (
                        // For SVG content
                        <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex flex-col items-center justify-center text-xs text-center p-2">
                          <div className="text-lg mb-1">🎨</div>
                          <div className="font-medium">Vector</div>
                          <div className="text-gray-600">SVG Art</div>
                        </div>
                      ) : (
                        // Standard image ordinals
                        <img 
                          src={nft.imageUrl} 
                          alt={nft.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            console.log(`❌ Failed to load image for ${nft.name}:`, nft.imageUrl);
                            target.style.display = 'none';
                            // Show fallback
                            const fallback = target.parentElement?.parentElement?.querySelector('.image-fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log(`✅ Successfully loaded image for ${nft.name}`);
                          }}
                        />
                      )}
                      
                      {/* Enhanced fallback for failed image loads */}
                      <div 
                        className="image-fallback absolute inset-0 bg-gradient-to-br from-orange-100 to-yellow-100 flex flex-col items-center justify-center text-xs text-center p-2"
                        style={{ display: 'none' }}
                      >
                        <div className="text-lg mb-1">
                          {nft.type === 'ordinal' ? '🟠' : '🖼️'}
                        </div>
                        <div className="font-medium">
                          {nft.type === 'ordinal' ? 'Ordinal' : 'NFT'}
                        </div>
                        <div className="text-center text-gray-600">
                          {nft.inscriptionNumber ? `#${nft.inscriptionNumber}` : 'Image Loading...'}
                        </div>
                        {nft.contentType && (
                          <div className="text-xs text-gray-500 mt-1">
                            {nft.contentType}
                          </div>
                        )}
                      </div>
                      
                      {/* Special badge for known collections */}
                      {nft.collectionName?.toLowerCase().includes('quantum cat') && (
                        <div className="absolute top-1 right-1 bg-purple-500 text-white text-xs px-1 py-0.5 rounded">
                          ⚡
                        </div>
                      )}
                      {nft.collectionName?.toLowerCase().includes('nodemonke') && (
                        <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded">
                          🐵
                        </div>
                      )}
                      {nft.collectionName?.toLowerCase().includes('taproot wizard') && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                          🧙
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Fallback for missing images */
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs p-2 bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-lg mb-1">
                        {nft.type === 'ordinal' ? '🟠' : '🖼️'}
                      </div>
                      <div className="font-medium">
                        {nft.type === 'ordinal' ? 'Ordinal' : 'NFT'}
                      </div>
                      <div className="text-center">
                        {nft.inscriptionNumber ? `#${nft.inscriptionNumber}` : 'No Image URL'}
                      </div>
                      {nft.contentType && (
                        <div className="text-xs text-gray-500 mt-1">
                          {nft.contentType}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Enhanced NFT Info Tooltip */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-85 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="truncate font-medium">{nft.name}</div>
                  {nft.collectionName && (
                    <div className="truncate text-gray-300">{nft.collectionName}</div>
                  )}
                  {nft.inscriptionNumber && (
                    <div className="text-gray-400">#{nft.inscriptionNumber}</div>
                  )}
                  {nft.contentType && (
                    <div className="text-gray-400 text-xs mt-1">{nft.contentType}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Toggle Button for more NFTs */}
          {nftAssets.length > 12 && (
            <div className="mt-4 text-center">
              <button 
                onClick={() => setShowAllNFTs(!showAllNFTs)}
                className="px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
              >
                {showAllNFTs ? (
                  <>Show Less ↑</>
                ) : (
                  <>View all {nftAssets.length} NFTs ↓</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}