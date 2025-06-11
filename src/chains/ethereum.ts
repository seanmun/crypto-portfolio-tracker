import { ethers } from 'ethers';
import { Asset, APIResponse } from '@/types';

/**
 * Ethereum Chain Handler
 * 
 * This handles all Ethereum blockchain interactions including:
 * - ETH balance fetching
 * - ERC-20 token detection and balances
 * - NFT (ERC-721/ERC-1155) detection
 * 
 * CUSTOMIZATION POINTS:
 * - RPC_URL: Change to use different RPC provider
 * - POPULAR_TOKENS: Add/remove tokens to check
 * - NFT_API: Switch between Alchemy/Moralis/OpenSea for NFT data
 */

export class EthereumHandler {
  private provider: ethers.JsonRpcProvider;
  private readonly CHAIN_ID = 1;
  private readonly CHAIN_NAME = 'ethereum';

  // CUSTOMIZATION: Add your preferred RPC URL here
  private readonly RPC_URL = (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY && 
                               process.env.NEXT_PUBLIC_ALCHEMY_API_KEY !== 'your_alchemy_key_here')
    ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    : 'https://ethereum.publicnode.com'; // Free fallback - no API key needed

  // CUSTOMIZATION: Add/remove popular tokens to automatically check
  private readonly POPULAR_TOKENS = [
      {
    address: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39', // HEX token
    symbol: 'HEX',
    name: 'HEX',
    decimals: 8
  }
  ,{
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC - correct checksum
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      symbol: 'USDT', 
      name: 'Tether USD',
      decimals: 6
    },
    {
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
      symbol: 'LINK',
      name: 'Chainlink',
      decimals: 18
    }
  ];

  constructor() {
    this.provider = new ethers.JsonRpcProvider(this.RPC_URL);
  }

  /**
   * Get ETH balance for an address
   */
  async getETHBalance(address: string): Promise<APIResponse<Asset>> {
    try {
      console.log(`🔍 Fetching ETH balance for: ${address}`);
      
      const balance = await this.provider.getBalance(address);
      const balanceFormatted = ethers.formatEther(balance);
      
      const asset: Asset = {
        id: `eth_${address}_native`,
        type: 'native',
        chain: this.CHAIN_NAME,
        walletAddress: address,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        balance: balance.toString(),
        balanceFormatted: balanceFormatted,
        lastUpdated: new Date()
      };

      console.log(`✅ ETH Balance: ${balanceFormatted} ETH`);
      
      return {
        success: true,
        data: asset,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Error fetching ETH balance:', error);
      return {
        success: false,
        error: `Failed to fetch ETH balance: ${error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get ERC-20 token balances for popular tokens
   */
  async getTokenBalances(address: string): Promise<APIResponse<Asset[]>> {
    try {
      console.log(`🪙 Fetching token balances for: ${address}`);
      
      const assets: Asset[] = [];
      
      // ERC-20 ABI for balanceOf function
      const erc20ABI = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)',
        'function name() view returns (string)'
      ];

      for (const token of this.POPULAR_TOKENS) {
        try {
          const contract = new ethers.Contract(
            ethers.getAddress(token.address), // Fix checksum issues
            erc20ABI, 
            this.provider
          );
          const balance = await contract.balanceOf(address);
          
          // Only include tokens with non-zero balance
          if (balance > 0) {
            const balanceFormatted = ethers.formatUnits(balance, token.decimals);
            
            const asset: Asset = {
              id: `eth_${address}_${token.address}`,
              type: 'token',
              chain: this.CHAIN_NAME,
              walletAddress: address,
              name: token.name,
              symbol: token.symbol,
              decimals: token.decimals,
              balance: balance.toString(),
              balanceFormatted: balanceFormatted,
              contractAddress: token.address,
              tokenStandard: 'ERC-20',
              lastUpdated: new Date()
            };

            assets.push(asset);
            console.log(`✅ ${token.symbol}: ${balanceFormatted}`);
          }
        } catch (tokenError) {
          console.warn(`⚠️ Failed to fetch ${token.symbol}:`, tokenError);
        }
      }

      return {
        success: true,
        data: assets,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Error fetching token balances:', error);
      return {
        success: false,
        error: `Failed to fetch token balances: ${error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get NFTs using Alchemy API (if available)
   */
  async getNFTs(address: string): Promise<APIResponse<Asset[]>> {
    try {
      console.log(`🖼️ Fetching NFTs for: ${address}`);
      
      if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
        console.warn('⚠️ No Alchemy API key found, skipping NFT fetch');
        return {
          success: true,
          data: [],
          timestamp: new Date()
        };
      }

      const alchemyUrl = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/getNFTs/?owner=${address}`;
      
      const response = await fetch(alchemyUrl);
      const data = await response.json();
      
      if (!data.ownedNfts) {
        return {
          success: true,
          data: [],
          timestamp: new Date()
        };
      }

      const assets: Asset[] = data.ownedNfts.map((nft: any) => {
        const asset: Asset = {
          id: `eth_${address}_${nft.contract.address}_${nft.id.tokenId}`,
          type: 'nft',
          chain: this.CHAIN_NAME,
          walletAddress: address,
          name: nft.title || nft.metadata?.name || 'Unknown NFT',
          symbol: nft.contract.symbol || 'NFT',
          balance: '1',
          balanceFormatted: '1',
          contractAddress: nft.contract.address,
          tokenId: nft.id.tokenId,
          tokenStandard: nft.contract.tokenType,
          imageUrl: nft.metadata?.image || nft.media?.[0]?.gateway,
          collectionName: nft.contract.name,
          lastUpdated: new Date()
        };
        
        return asset;
      });

      console.log(`✅ Found ${assets.length} NFTs`);
      
      return {
        success: true,
        data: assets,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Error fetching NFTs:', error);
      return {
        success: false,
        error: `Failed to fetch NFTs: ${error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get all assets for a wallet (ETH + Tokens + NFTs)
   */
  async getAllAssets(address: string): Promise<APIResponse<Asset[]>> {
    try {
      console.log(`🔄 Fetching all Ethereum assets for: ${address}`);
      
      const allAssets: Asset[] = [];
      
      // Fetch ETH balance
      const ethResult = await this.getETHBalance(address);
      if (ethResult.success && ethResult.data) {
        allAssets.push(ethResult.data);
      }
      
      // Fetch token balances
      const tokensResult = await this.getTokenBalances(address);
      if (tokensResult.success && tokensResult.data) {
        allAssets.push(...tokensResult.data);
      }
      
      // Fetch NFTs
      const nftsResult = await this.getNFTs(address);
      if (nftsResult.success && nftsResult.data) {
        allAssets.push(...nftsResult.data);
      }

      console.log(`✅ Total Ethereum assets found: ${allAssets.length}`);
      
      return {
        success: true,
        data: allAssets,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Error fetching all assets:', error);
      return {
        success: false,
        error: `Failed to fetch all assets: ${error}`,
        timestamp: new Date()
      };
    }
  }
}