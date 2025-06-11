import { Asset, APIResponse } from '@/types';

/**
 * Bitcoin Handler - BTC + Ordinals Support
 * 
 * Bitcoin integration for the HEX-focused portfolio tracker.
 * Handles:
 * - BTC balance fetching
 * - Ordinals (Bitcoin NFTs) detection with special handling for Quantum Cats
 * - UTXO management
 * 
 * CUSTOMIZATION POINTS:
 * - API_BASE_URL: Bitcoin API endpoint (Blockstream, Mempool, etc.)
 * - ORDINALS_API: Ordinals indexer endpoint
 * - Address format validation (Legacy, SegWit, Taproot)
 */

export class BitcoinHandler {
  private readonly CHAIN_NAME = 'bitcoin';
  
  // CUSTOMIZATION: Bitcoin API endpoints
  private readonly API_BASE_URL = 'https://blockstream.info/api';
  
  // Bitcoin address format detection
  private readonly ADDRESS_PATTERNS = {
    legacy: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,     // P2PKH/P2SH
    segwit: /^bc1[a-z0-9]{39,59}$/,                   // Bech32
    taproot: /^bc1p[a-z0-9]{58}$/                     // Bech32m
  };

  constructor() {
    console.log('🟠 Bitcoin handler initialized');
  }

  /**
   * Validate Bitcoin address format
   */
  private validateBitcoinAddress(address: string): boolean {
    return Object.values(this.ADDRESS_PATTERNS).some(pattern => pattern.test(address));
  }

  /**
   * Get address type for display purposes
   */
  private getAddressType(address: string): string {
    if (this.ADDRESS_PATTERNS.legacy.test(address)) return 'Legacy';
    if (this.ADDRESS_PATTERNS.segwit.test(address)) return 'SegWit';
    if (this.ADDRESS_PATTERNS.taproot.test(address)) return 'Taproot';
    return 'Unknown';
  }

  /**
   * Get BTC balance for an address
   */
  async getBTCBalance(address: string): Promise<APIResponse<Asset>> {
    try {
      if (!this.validateBitcoinAddress(address)) {
        throw new Error('Invalid Bitcoin address format');
      }

      console.log(`🟠 Fetching BTC balance for: ${address} (${this.getAddressType(address)})`);
      
      // Fetch address info from Blockstream API
      const response = await fetch(`${this.API_BASE_URL}/address/${address}`);
      
      if (!response.ok) {
        throw new Error(`Bitcoin API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert satoshis to BTC (1 BTC = 100,000,000 satoshis)
      const balanceSatoshis = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
      const balanceBTC = balanceSatoshis / 100000000;
      
      const asset: Asset = {
        id: `btc_${address}_native`,
        type: 'native',
        chain: this.CHAIN_NAME,
        walletAddress: address,
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8,
        balance: balanceSatoshis.toString(),
        balanceFormatted: balanceBTC.toFixed(8),
        lastUpdated: new Date()
      };

      console.log(`✅ BTC Balance: ${balanceBTC.toFixed(8)} BTC (${balanceSatoshis.toLocaleString()} sats)`);
      
      return {
        success: true,
        data: asset,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Error fetching BTC balance:', error);
      return {
        success: false,
        error: `Failed to fetch BTC balance: ${error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get Ordinals (Bitcoin NFTs) using multiple indexer APIs
   */
  async getOrdinals(address: string): Promise<APIResponse<Asset[]>> {
    try {
      console.log(`🖼️ Fetching Ordinals (Bitcoin NFTs) for: ${address}`);
      
      const ordinals: Asset[] = [];
      
      // Try different Ordinals indexers for better coverage
      const indexers = [
        {
          name: 'Hiro API',
          url: `https://api.hiro.so/ordinals/v1/inscriptions?address=${address}`,
          parseFunction: this.parseHiroOrdinals.bind(this)
        },
        // Fallback to MagicEden if Hiro fails
        {
          name: 'MagicEden API', 
          url: `https://api-mainnet.magiceden.dev/v2/ord/btc/tokens?owner=${address}`,
          parseFunction: this.parseMagicEdenOrdinals.bind(this)
        }
      ];

      // Try each indexer until we get results
      for (const indexer of indexers) {
        try {
          console.log(`🔍 Trying ${indexer.name} for Ordinals...`);
          
          const response = await fetch(indexer.url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'HEX-Portfolio-Tracker/1.0'
            }
          });
          
          if (!response.ok) {
            console.warn(`⚠️ ${indexer.name} returned ${response.status}, trying next...`);
            continue;
          }
          
          const data = await response.json();
          const parsedOrdinals = await indexer.parseFunction(data, address);
          
          if (parsedOrdinals.length > 0) {
            ordinals.push(...parsedOrdinals);
            console.log(`✅ Found ${parsedOrdinals.length} Ordinals via ${indexer.name}`);
            break; // Success, no need to try other indexers
          }
          
        } catch (indexerError) {
          console.warn(`⚠️ ${indexer.name} failed:`, indexerError);
          continue; // Try next indexer
        }
      }

      // If no indexers worked, return empty array (not an error)
      if (ordinals.length === 0) {
        console.log(`📭 No Ordinals found for this address`);
      }
      
      return {
        success: true,
        data: ordinals,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Error fetching Ordinals:', error);
      return {
        success: false,
        error: `Failed to fetch Ordinals: ${error}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Parse Hiro API ordinals response
   */
  private async parseHiroOrdinals(data: any, address: string): Promise<Asset[]> {
    const ordinals: Asset[] = [];
    
    if (!data.results || !Array.isArray(data.results)) {
      return ordinals;
    }

    for (const inscription of data.results) {
      try {
        // Detect special inscription types
        const specialType = this.detectSpecialInscriptionType(inscription);
        
        const asset: Asset = {
          id: `btc_${address}_ordinal_${inscription.id}`,
          type: 'ordinal',
          chain: this.CHAIN_NAME,
          walletAddress: address,
          name: this.getInscriptionName(inscription, specialType),
          symbol: 'ORD',
          balance: '1',
          balanceFormatted: '1',
          
          // Ordinal-specific fields
          tokenId: inscription.id,
          inscriptionId: inscription.id,
          inscriptionNumber: inscription.number,
          contentType: inscription.content_type,
          contentUrl: inscription.content_url,
          
          // Enhanced image handling for special types
          imageUrl: this.getOrdinalImageUrl(inscription, specialType),
          
          // Collection info with special handling
          collectionName: this.getCollectionName(inscription, specialType),
          
          lastUpdated: new Date()
        };

        ordinals.push(asset);
      } catch (parseError) {
        console.warn('⚠️ Failed to parse ordinal:', parseError);
      }
    }

    return ordinals;
  }

  /**
   * Parse MagicEden API ordinals response
   */
  private async parseMagicEdenOrdinals(data: any, address: string): Promise<Asset[]> {
    const ordinals: Asset[] = [];
    
    if (!Array.isArray(data)) {
      return ordinals;
    }

    for (const token of data) {
      try {
        const asset: Asset = {
          id: `btc_${address}_ordinal_${token.id}`,
          type: 'ordinal',
          chain: this.CHAIN_NAME,
          walletAddress: address,
          name: token.meta?.name || `Ordinal #${token.inscriptionNumber}`,
          symbol: 'ORD',
          balance: '1',
          balanceFormatted: '1',
          
          // Ordinal-specific fields
          tokenId: token.id,
          inscriptionId: token.id,
          inscriptionNumber: token.inscriptionNumber,
          contentType: token.contentType,
          
          // Image from MagicEden
          imageUrl: token.meta?.image || token.imageURI,
          
          // Collection info
          collectionName: token.collectionSymbol || 'Bitcoin Ordinals',
          
          lastUpdated: new Date()
        };

        ordinals.push(asset);
      } catch (parseError) {
        console.warn('⚠️ Failed to parse MagicEden ordinal:', parseError);
      }
    }

    return ordinals;
  }

  /**
   * Detect special inscription types (Quantum Cats, NodeMonkes, etc.)
   */
  private detectSpecialInscriptionType(inscription: any): string {
    const content = inscription.content_type?.toLowerCase() || '';
    const title = inscription.title?.toLowerCase() || '';
    
    // Quantum Cats detection
    if (title.includes('quantum cat') || 
        inscription.collection_id?.includes('quantum-cats') ||
        content.includes('html') && title.includes('cat')) {
      return 'quantum-cats';
    }
    
    // NodeMonkes detection
    if (title.includes('nodemonke') || 
        inscription.collection_id?.includes('nodemonkes')) {
      return 'nodemonkes';
    }
    
    // Bitcoin Puppets
    if (title.includes('bitcoin puppet') || 
        inscription.collection_id?.includes('bitcoin-puppets')) {
      return 'bitcoin-puppets';
    }
    
    // Taproot Wizards
    if (title.includes('taproot wizard') || 
        inscription.collection_id?.includes('taproot-wizards')) {
      return 'taproot-wizards';
    }
    
    // HTML/Interactive content
    if (content.includes('html') || content.includes('javascript')) {
      return 'interactive';
    }
    
    // Text inscriptions
    if (content.includes('text')) {
      return 'text';
    }
    
    // SVG inscriptions
    if (content.includes('svg')) {
      return 'svg';
    }
    
    return 'standard';
  }

  /**
   * Get appropriate name based on inscription type
   */
  private getInscriptionName(inscription: any, specialType: string): string {
    // Use provided title if available
    if (inscription.title && inscription.title.trim()) {
      return inscription.title;
    }
    
    // Special naming for known collections
    switch (specialType) {
      case 'quantum-cats':
        return `Quantum Cat #${inscription.number}`;
      case 'nodemonkes':
        return `NodeMonke #${inscription.number}`;
      case 'bitcoin-puppets':
        return `Bitcoin Puppet #${inscription.number}`;
      case 'taproot-wizards':
        return `Taproot Wizard #${inscription.number}`;
      case 'interactive':
        return `Interactive Inscription #${inscription.number}`;
      case 'text':
        return `Text Inscription #${inscription.number}`;
      case 'svg':
        return `SVG Inscription #${inscription.number}`;
      default:
        return `Inscription #${inscription.number}`;
    }
  }

  /**
   * Get collection name with special handling
   */
  private getCollectionName(inscription: any, specialType: string): string {
    // Use provided collection if available
    if (inscription.collection_id) {
      return inscription.collection_id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
    
    // Special collection names
    switch (specialType) {
      case 'quantum-cats':
        return 'Quantum Cats';
      case 'nodemonkes':
        return 'NodeMonkes';
      case 'bitcoin-puppets':
        return 'Bitcoin Puppets';
      case 'taproot-wizards':
        return 'Taproot Wizards';
      case 'interactive':
        return 'Interactive Ordinals';
      case 'text':
        return 'Text Inscriptions';
      case 'svg':
        return 'SVG Inscriptions';
      default:
        return 'Bitcoin Ordinals';
    }
  }

  /**
   * Get image URL for ordinal inscription with special handling
   */
  private getOrdinalImageUrl(inscription: any, specialType?: string): string | undefined {
    // For Quantum Cats and other HTML/interactive content
    if (specialType === 'quantum-cats' || specialType === 'interactive') {
      // Quantum Cats are HTML that need to be rendered
      const possibleUrls = [
        inscription.preview_url,
        `https://ordinals.com/preview/${inscription.id}`,
        `https://ordinals.com/content/${inscription.id}`,
        inscription.content_url,
      ];
      
      for (const url of possibleUrls) {
        if (url && typeof url === 'string' && url.startsWith('http')) {
          return url;
        }
      }
    }
    
    // For SVG content, we can display directly
    if (specialType === 'svg' && inscription.content_url) {
      return inscription.content_url;
    }
    
    // For text inscriptions, return undefined to show placeholder
    if (specialType === 'text') {
      return undefined;
    }
    
    // Standard image ordinals - try multiple endpoints
    const inscriptionId = inscription.id || inscription.inscription_id;
    const possibleUrls = [
      // Direct content URLs
      inscription.content_url,
      inscription.preview_url,
      
      // Ordinals.com endpoints
      `https://ordinals.com/content/${inscriptionId}`,
      `https://ordinals.com/preview/${inscriptionId}`,
      
      // Ord.io endpoints  
      `https://ord.io/${inscriptionId}`,
      
      // Alternative ordinals services
      `https://ordinalslite.com/content/${inscriptionId}`,
      
      // Hiro API content endpoint
      `https://api.hiro.so/ordinals/v1/inscriptions/${inscriptionId}/content`,
    ];

    console.log(`🖼️ Trying image URLs for inscription ${inscriptionId}:`, possibleUrls);

    // Return first valid-looking URL
    for (const url of possibleUrls) {
      if (url && typeof url === 'string' && url.startsWith('http')) {
        return url;
      }
    }

    return undefined;
  }

  /**
   * Get all Bitcoin assets (BTC + Ordinals)
   */
  async getAllAssets(address: string): Promise<APIResponse<Asset[]>> {
    try {
      console.log(`🔄 Fetching all Bitcoin assets for: ${address}`);
      
      const allAssets: Asset[] = [];
      
      // Fetch BTC balance
      const btcResult = await this.getBTCBalance(address);
      if (btcResult.success && btcResult.data) {
        allAssets.push(btcResult.data);
      }
      
      // Fetch Ordinals (Bitcoin NFTs)
      const ordinalsResult = await this.getOrdinals(address);
      if (ordinalsResult.success && ordinalsResult.data) {
        allAssets.push(...ordinalsResult.data);
      }

      console.log(`✅ Total Bitcoin assets found: ${allAssets.length}`);
      
      return {
        success: true,
        data: allAssets,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Error fetching all Bitcoin assets:', error);
      return {
        success: false,
        error: `Failed to fetch all Bitcoin assets: ${error}`,
        timestamp: new Date()
      };
    }
  }
}