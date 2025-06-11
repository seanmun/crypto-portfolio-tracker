# 🔥 HEX-Focused Crypto Portfolio Tracker - Project Context

## 🎯 Project Vision

**Privacy-first, self-hosted multi-chain cryptocurrency portfolio tracker with a focus on the HEX ecosystem.**

This is a community-driven project designed to give crypto users full control over their portfolio data while providing specialized features for HEX holders across multiple blockchains.

---

## 🏗️ Current Project Structure

```
crypto-portfolio-tracker/
├── src/
│   ├── app/                          # Next.js 15 app directory
│   │   ├── layout.tsx               # Root layout with HEX branding
│   │   ├── page.tsx                 # Homepage with feature overview
│   │   ├── test/page.tsx            # Development test page (tri-chain testing)
│   │   └── globals.css              # Global styles with Tailwind
│   ├── chains/                      # Blockchain integration handlers
│   │   ├── ethereum.ts              # Ethereum + ERC-20 + NFTs
│   │   ├── pulsechain.ts            # Pulsechain + HEX + PRC-20 (HEX-focused)
│   │   └── bitcoin.ts               # Bitcoin + Ordinals (with Quantum Cats support)
│   ├── config/                      # Configuration files (community customizable)
│   │   ├── chains.json              # Chain settings (RPC, colors, features)
│   │   ├── display.json             # UI display preferences
│   │   └── tokens.json              # Popular token lists per chain
│   ├── types/                       # TypeScript definitions
│   │   └── index.ts                 # Core types (Asset, Wallet, Portfolio, etc.)
│   ├── components/                  # React components (organized by feature)
│   │   ├── ui/                      # Reusable UI components
│   │   ├── portfolio/               # Portfolio-specific components
│   │   └── wallet/                  # Wallet management components
│   ├── hooks/                       # Custom React hooks
│   └── utils/                       # Helper functions
├── .env.local                       # Environment variables (API keys, test wallets)
├── .env.example                     # Template for environment setup
├── package.json                     # Dependencies and scripts
├── tailwind.config.js               # Tailwind with HEX theme colors
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # Comprehensive setup and contribution guide
```

---

## 🔗 Supported Blockchains (Current Status)

| Blockchain | Status | Features | Notes |
|------------|--------|----------|--------|
| **Bitcoin** | ✅ Working | BTC balance, Ordinals detection | Image loading for Ordinals needs work |
| **Ethereum** | ✅ Working | ETH, ERC-20 (HEX, USDC, USDT, LINK), NFTs | Full integration with Alchemy API support |
| **Pulsechain** | ✅ Working | PLS, HEX, PRC-20 tokens | HEX ecosystem focus, same address as Ethereum |
| **Base** | 🔄 Planned | ETH L2, ERC-20, NFTs | EVM compatible, use Ethereum handler |
| **Solana** | 🔄 Planned | SOL, SPL tokens, Solana NFTs | Structure ready in config |

---

## 🔥 HEX Ecosystem Focus

### **Core Philosophy:**
This tracker is built specifically for the HEX community with features that traditional portfolio trackers don't offer.

### **HEX-Specific Features (Planned):**
- **🎯 HEX Staking Integration**: Detect T-Shares, calculate interest earned
- **📅 Stake Maturity Tracking**: Know when stakes can be ended penalty-free
- **🔥 Multi-Chain HEX**: Compare HEX holdings across Ethereum and Pulsechain
- **📊 Staking Analytics**: Optimize staking strategies, track performance
- **🔶 Hexagon UI**: Design elements that reflect HEX branding

### **Current HEX Integration:**
- ✅ **Liquid HEX Detection**: On both Ethereum and Pulsechain
- ⏳ **Staking Detection**: Structure ready, implementation pending
- ✅ **Multi-Chain Support**: Same wallet address works on both EVM chains

---

## 🎨 Design Principles

### **Privacy-First:**
- **Self-hosted**: No data sent to external servers
- **Local storage**: All data stays in browser
- **No tracking**: No analytics or data collection
- **Open source**: Fully auditable code

### **HEX Branding:**
- **Color Scheme**: Pink (#ff006b), purple gradients, hexagon elements
- **Visual Identity**: Hexagonal components where relevant
- **Community-Focused**: Built by HEX holders, for HEX holders

### **Modular Architecture:**
- **Easy Customization**: Configuration files for chains, tokens, UI
- **Community Contributions**: Clear structure for adding features
- **Extensible**: Add new blockchains, tokens, features easily

---

## 🛠️ Technology Stack

### **Frontend:**
- **Next.js 15**: React framework with TypeScript
- **Tailwind CSS v4**: Utility-first styling with HEX theme
- **React Hooks**: State management (useState, useEffect)

### **Blockchain Integration:**
- **Ethers.js**: Ethereum, Pulsechain, Base interactions
- **Solana Web3.js**: Solana integration (planned)
- **Public RPCs**: Free blockchain access (Alchemy optional)

### **APIs Used:**
- **Ethereum**: Free public RPC, Alchemy (optional for NFTs)
- **Bitcoin**: Blockstream API, Hiro API (Ordinals), MagicEden (fallback)
- **Pulsechain**: Public Pulsechain RPC
- **Pricing**: CoinGecko API (planned)

---

## 🚀 Development Status

### **✅ Completed (MVP Foundation):**
- **Tri-Chain Architecture**: Bitcoin, Ethereum, Pulsechain working
- **Asset Detection**: Native tokens, ERC-20s, NFTs, Ordinals
- **UI Foundation**: Test page with chain-specific displays
- **Configuration System**: Modular, community-customizable
- **TypeScript Setup**: Fully typed for better DX
- **NFT Grid Display**: Organized NFT viewing with expand/collapse

### **🔄 In Progress:**
- **Ordinals Image Loading**: Detection works, images need debugging
- **HEX Staking Integration**: T-Shares detection and calculations

### **📋 Next Priorities:**
1. **HEX Staking Detection**: Core feature for HEX holders
2. **Price Integration**: USD values from CoinGecko
3. **Hexagon UI Components**: Replace rectangles with hexagons
4. **Portfolio Dashboard**: Main user interface beyond test page
5. **Wallet Management**: Add/edit/remove wallets with NFT avatars

---

## 🧪 Testing Setup

### **Environment Variables (.env.local):**
```bash
# Test wallet addresses
NEXT_PUBLIC_TEST_ETH_WALLET=0x...     # Ethereum/Pulsechain address
NEXT_PUBLIC_TEST_BTC_WALLET=bc1...    # Bitcoin address

# Optional API keys
NEXT_PUBLIC_ALCHEMY_API_KEY=...       # For enhanced NFT support
NEXT_PUBLIC_COINGECKO_API_KEY=...     # For pricing (future)
```

### **Test Page Usage:**
- **URL**: http://localhost:3000/test
- **Purpose**: Development testing of all blockchain integrations
- **Features**: Individual chain testing + "Fetch All Chains" button
- **Debugging**: Detailed console logs for all API calls

---

## 🤝 Community Contribution Areas

### **Immediate Needs:**
- **🔥 HEX Staking Contracts**: Help with T-Shares calculation logic
- **🖼️ Ordinals Images**: Fix image loading for Bitcoin NFTs
- **🎨 Hexagon Components**: Convert UI elements to hexagonal shapes
- **⛓️ More Chains**: Add Arbitrum, Polygon, BSC support

### **Future Enhancements:**
- **📱 Mobile App**: React Native version
- **🌐 3D Portfolio**: React Three Fiber "Portfolio City"
- **📊 Analytics**: Historical tracking, performance metrics
- **🔒 Security**: Hardware wallet integration

---

## 📞 Development Notes

### **Key Files to Know:**
- **`src/chains/*.ts`**: Blockchain integration logic
- **`src/config/*.json`**: Easy customization points
- **`src/app/test/page.tsx`**: Main testing interface
- **`src/types/index.ts`**: TypeScript definitions
- **`tailwind.config.js`**: HEX theme colors and hexagon utilities

### **Common Tasks:**
- **Add New Token**: Update `chains.json` and relevant chain handler
- **Add New Chain**: Create new handler in `src/chains/`
- **Modify UI**: Update components and Tailwind classes
- **Debug APIs**: Check browser console in test page

### **Known Issues:**
- **Ordinals Images**: URLs work but images don't load (CORS/format issues)
- **Rate Limiting**: Free APIs may throttle requests
- **Cross-Origin**: Some blockchain services block browser requests

---

## 🎯 Long-Term Vision

**The ultimate goal is to create the definitive portfolio tracker for the HEX ecosystem** - a tool that understands HEX staking, provides meaningful analytics, and gives users complete control over their data.

This project should become the go-to solution for HEX holders who want:
- **Privacy**: No third-party data collection
- **Functionality**: Features specific to HEX/crypto needs
- **Community**: Built and maintained by the community
- **Beauty**: A UI that reflects the HEX brand and philosophy

---

*Last Updated: June 11, 2025*
*Current Version: MVP Foundation Complete*
*Next Focus: HEX Staking Integration*