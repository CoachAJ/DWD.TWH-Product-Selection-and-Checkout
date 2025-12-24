import { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, ExternalLink, Settings, X, Sparkles, Package } from 'lucide-react';
import Fuse from 'fuse.js';
import { loadProducts, products } from './data/products';
import { useCartStore } from './store/useCartStore';
import { Product } from './types';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [tempDistributorId, setTempDistributorId] = useState('');

  const {
    items,
    distributorId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setDistributorId,
    getCheckoutUrl,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  // Initialize Fuse.js for fuzzy search - stricter matching
  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ['name', 'sku'],
      threshold: 0.2,  // Stricter matching (lower = more strict)
      includeScore: true,
      minMatchCharLength: 3,
      ignoreLocation: true,  // Search anywhere in the string
    });
  }, [products.length]);

  // Load products on mount
  useEffect(() => {
    loadProducts().then(() => {
      setIsLoading(false);
    });
  }, []);

  // Initialize temp distributor ID
  useEffect(() => {
    setTempDistributorId(distributorId);
  }, [distributorId]);

  // Search products - only show good matches
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = fuse.search(searchQuery, { limit: 30 });
    // Filter to only include results with good scores (lower is better)
    const goodMatches = results
      .filter((r) => r.score !== undefined && r.score < 0.3)
      .map((r) => r.item);
    setSearchResults(goodMatches.slice(0, 20));
  }, [searchQuery, fuse]);

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleSaveSettings = () => {
    if (tempDistributorId.trim()) {
      setDistributorId(tempDistributorId.trim());
    }
    setShowSettings(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3CAADF] border-t-[#F58A34] mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#FFB81C]" />
          </div>
          <p className="mt-4 text-[#58595B] font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0068B3] via-[#3CAADF] to-[#0068B3] text-white shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Sunflower Logo */}
              <div className="w-10 h-10 md:w-12 md:h-12 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                  <g fill="#FFB81C">
                    <ellipse cx="50" cy="20" rx="12" ry="20" transform="rotate(0 50 50)"/>
                    <ellipse cx="50" cy="20" rx="12" ry="20" transform="rotate(45 50 50)"/>
                    <ellipse cx="50" cy="20" rx="12" ry="20" transform="rotate(90 50 50)"/>
                    <ellipse cx="50" cy="20" rx="12" ry="20" transform="rotate(135 50 50)"/>
                    <ellipse cx="50" cy="20" rx="12" ry="20" transform="rotate(180 50 50)"/>
                    <ellipse cx="50" cy="20" rx="12" ry="20" transform="rotate(225 50 50)"/>
                    <ellipse cx="50" cy="20" rx="12" ry="20" transform="rotate(270 50 50)"/>
                    <ellipse cx="50" cy="20" rx="12" ry="20" transform="rotate(315 50 50)"/>
                  </g>
                  <circle cx="50" cy="50" r="22" fill="#784434"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  <span className="text-[#3CAADF]">Daily with</span>{' '}
                  <span className="text-white">Doc</span>{' '}
                  <span className="text-[#F58A34]">& Becca</span>
                </h1>
                <p className="text-xs md:text-sm text-white/80 hidden sm:block">Product Search & Checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 md:p-3 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
                title="Settings"
              >
                <Settings className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={() => setShowCart(!showCart)}
                className="lg:hidden relative p-2 md:p-3 hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F58A34] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              <div className="hidden lg:block relative">
                <ShoppingCart className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#F58A34] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Search Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6 border border-white/50">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="p-2 bg-gradient-to-br from-[#3CAADF] to-[#0068B3] rounded-xl">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-[#58595B]">Search Products</h2>
              </div>
              
              {/* Search Input */}
              <div className="relative mb-4 md:mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3CAADF] w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name or SKU..."
                  className="w-full pl-12 pr-4 py-3 md:py-4 border-2 border-[#3CAADF]/30 rounded-xl focus:ring-4 focus:ring-[#3CAADF]/20 focus:border-[#3CAADF] outline-none transition-all text-[#58595B] placeholder:text-gray-400 bg-white shadow-inner"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 ? (
                <div className="space-y-3 max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2">
                  {searchResults.map((product, index) => (
                    <div
                      key={product.sku}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-[#3CAADF]/5 hover:to-[#F58A34]/5 transition-all duration-300 border border-gray-100 hover:border-[#3CAADF]/30 hover:shadow-md group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-1 mb-3 sm:mb-0">
                        <h3 className="font-semibold text-[#58595B] group-hover:text-[#0068B3] transition-colors">{product.name}</h3>
                        <p className="text-sm text-gray-400 font-mono">SKU: {product.sku}</p>
                        <p className="text-[#0068B3] font-bold text-lg">${product.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => addItem(product)}
                        className="w-full sm:w-auto sm:ml-4 bg-gradient-to-r from-[#0068B3] to-[#3CAADF] hover:from-[#005a9e] hover:to-[#0068B3] text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No products found for "<span className="font-semibold text-[#0068B3]">{searchQuery}</span>"</p>
                  <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#3CAADF]/20 to-[#F58A34]/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-[#FFB81C]" />
                  </div>
                  <p className="text-[#58595B] font-medium">Start typing to search</p>
                  <p className="text-sm text-gray-400 mt-1">{products.length.toLocaleString()} products available</p>
                </div>
              )}
            </div>
          </div>

          {/* Cart Section - Mobile Slide-in + Desktop Sticky */}
          <div className={`lg:col-span-1 ${showCart ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'}`}>
            {/* Mobile Overlay */}
            {showCart && (
              <div 
                className="fixed inset-0 bg-black/50 lg:hidden"
                onClick={() => setShowCart(false)}
              />
            )}
            
            <div className={`${showCart ? 'fixed right-0 top-0 h-full w-full max-w-md animate-slide-in' : ''} lg:relative lg:w-auto lg:h-auto bg-white/95 backdrop-blur-sm rounded-none lg:rounded-2xl shadow-2xl p-4 md:p-6 lg:sticky lg:top-24 border-l lg:border border-white/50 overflow-y-auto max-h-screen lg:max-h-none`}>
              {/* Mobile Close Button */}
              <button
                onClick={() => setShowCart(false)}
                className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="p-2 bg-gradient-to-br from-[#F58A34] to-[#FFB81C] rounded-xl">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-[#58595B]">Your Cart</h2>
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="ml-auto text-red-500 hover:text-red-700 text-sm flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mt-1">Add products to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[300px] lg:max-h-[350px] overflow-y-auto mb-4 pr-1">
                    {items.map((item) => (
                      <div key={item.sku} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 border border-gray-100 hover:border-[#F58A34]/30 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 pr-2">
                            <h3 className="font-semibold text-[#58595B] text-sm leading-tight">{item.name}</h3>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">SKU: {item.sku}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.sku)}
                            className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-[#3CAADF] hover:text-white flex items-center justify-center transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-10 text-center font-bold text-[#58595B]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-[#3CAADF] hover:text-white flex items-center justify-center transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-bold text-[#0068B3]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Total */}
                  <div className="bg-gradient-to-r from-[#0068B3]/5 to-[#3CAADF]/5 rounded-xl p-4 mb-4 border border-[#3CAADF]/20">
                    <div className="flex justify-between items-center">
                      <span className="text-[#58595B] font-medium">Total</span>
                      <span className="text-2xl font-bold text-[#0068B3]">${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in cart
                    </p>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-[#F58A34] to-[#FFB81C] hover:from-[#e07a2a] hover:to-[#F58A34] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] animate-pulse-glow"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Checkout on Youngevity
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Distributor ID: <span className="font-mono text-[#0068B3]">{distributorId}</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-[#0068B3] to-[#3CAADF] rounded-xl">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#58595B]">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="ml-auto p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#58595B] mb-2">
                Distributor ID
              </label>
              <input
                type="text"
                value={tempDistributorId}
                onChange={(e) => setTempDistributorId(e.target.value)}
                placeholder="Enter your distributor ID"
                className="w-full px-4 py-3 border-2 border-[#3CAADF]/30 rounded-xl focus:ring-4 focus:ring-[#3CAADF]/20 focus:border-[#3CAADF] outline-none transition-all font-mono"
              />
              <p className="text-xs text-gray-400 mt-2">
                This ID will be used for the checkout URL
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-[#58595B]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#0068B3] to-[#3CAADF] text-white rounded-xl hover:from-[#005a9e] hover:to-[#0068B3] transition-all font-medium shadow-md hover:shadow-lg"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cart FAB */}
      {!showCart && getTotalItems() > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#F58A34] to-[#FFB81C] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse-glow"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-[#0068B3] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {getTotalItems()}
          </span>
        </button>
      )}
    </div>
  );
}

export default App;
