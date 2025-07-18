import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Star, TrendingUp, TrendingDown, Search, 
  BarChart3, DollarSign, Bitcoin, Activity, X 
} from 'lucide-react';

const WatchlistSidebar = ({ onAddChart, activeCharts = [], onRemoveChart }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Predefined popular assets
  const popularAssets = {
    stocks: [
      { symbol: 'AAPL', name: 'Apple Inc.', category: 'stocks' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'stocks' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'stocks' },
      { symbol: 'TSLA', name: 'Tesla Inc.', category: 'stocks' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'stocks' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'stocks' },
      { symbol: 'META', name: 'Meta Platforms', category: 'stocks' },
      { symbol: 'NFLX', name: 'Netflix Inc.', category: 'stocks' }
    ],
    crypto: [
      { symbol: 'BTCUSD', name: 'Bitcoin', category: 'crypto' },
      { symbol: 'ETHUSD', name: 'Ethereum', category: 'crypto' },
      { symbol: 'ADAUSD', name: 'Cardano', category: 'crypto' },
      { symbol: 'SOLUSD', name: 'Solana', category: 'crypto' },
      { symbol: 'DOTUSD', name: 'Polkadot', category: 'crypto' },
      { symbol: 'MATICUSD', name: 'Polygon', category: 'crypto' }
    ]
  };

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tradingWatchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    } else {
      // Initialize with some popular assets
      const defaultWatchlist = [
        ...popularAssets.stocks.slice(0, 4),
        ...popularAssets.crypto.slice(0, 2)
      ];
      setWatchlist(defaultWatchlist);
      localStorage.setItem('tradingWatchlist', JSON.stringify(defaultWatchlist));
    }
  }, []);

  // Save watchlist to localStorage
  const saveWatchlist = (newWatchlist) => {
    setWatchlist(newWatchlist);
    localStorage.setItem('tradingWatchlist', JSON.stringify(newWatchlist));
  };

  // Add asset to watchlist
  const addToWatchlist = (asset) => {
    if (!watchlist.find(item => item.symbol === asset.symbol)) {
      const newWatchlist = [...watchlist, asset];
      saveWatchlist(newWatchlist);
    }
    setShowAddModal(false);
  };

  // Remove asset from watchlist
  const removeFromWatchlist = (symbol) => {
    const newWatchlist = watchlist.filter(item => item.symbol !== symbol);
    saveWatchlist(newWatchlist);
    // Also remove from active charts
    onRemoveChart?.(symbol);
  };

  // Get all available assets for search
  const allAssets = [...popularAssets.stocks, ...popularAssets.crypto];
  
  // Filter assets based on search and category
  const filteredAssets = allAssets.filter(asset => {
    const matchesSearch = asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get icon for asset category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'stocks': return <BarChart3 className="w-4 h-4" />;
      case 'crypto': return <Bitcoin className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <>
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 h-full bg-background/95 backdrop-blur-sm border-r border-primary/30 p-4 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Watchlist
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
            title="Add Asset"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 mb-4">
          {['all', 'stocks', 'crypto'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-primary/20 text-primary'
                  : 'bg-background/50 text-muted-foreground hover:text-primary'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Watchlist Items */}
        <div className="space-y-2">
          <AnimatePresence>
            {watchlist
              .filter(asset => selectedCategory === 'all' || asset.category === selectedCategory)
              .map((asset, index) => (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  activeCharts.includes(asset.symbol)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background/50 hover:border-primary/50'
                }`}
                onClick={() => onAddChart?.(asset.symbol)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded ${asset.category === 'crypto' ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                      {getCategoryIcon(asset.category)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{asset.symbol}</div>
                      <div className="text-xs text-muted-foreground">{asset.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Price change indicator (mock) */}
                    <div className={`flex items-center text-xs ${Math.random() > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                      {Math.random() > 0.5 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span className="ml-1">
                        {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 5).toFixed(2)}%
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(asset.symbol);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Active Charts Info */}
        {activeCharts.length > 0 && (
          <div className="mt-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="text-xs text-primary font-semibold mb-2">
              Active Charts ({activeCharts.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {activeCharts.map(symbol => (
                <span
                  key={symbol}
                  className="px-2 py-1 bg-primary/20 text-primary text-xs rounded"
                >
                  {symbol}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Asset Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background border border-primary/30 rounded-lg p-6 w-96 max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Add to Watchlist</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-muted-foreground hover:text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex space-x-2 mb-4">
                {['all', 'stocks', 'crypto'].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary/20 text-primary'
                        : 'bg-background/50 text-muted-foreground hover:text-primary'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {/* Asset List */}
              <div className="space-y-2">
                {filteredAssets.map(asset => (
                  <button
                    key={asset.symbol}
                    onClick={() => addToWatchlist(asset)}
                    disabled={watchlist.find(item => item.symbol === asset.symbol)}
                    className="w-full p-3 text-left rounded-lg border border-border hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${asset.category === 'crypto' ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                        {getCategoryIcon(asset.category)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{asset.symbol}</div>
                        <div className="text-xs text-muted-foreground">{asset.name}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WatchlistSidebar;
