import { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, ExternalLink, Settings, X } from 'lucide-react';
import Fuse from 'fuse.js';
import { loadProducts, products } from './data/products';
import { useCartStore } from './store/useCartStore';
import { Product } from './types';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#0068B3] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">DWD Product Search</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="relative">
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Products</h2>
              
              {/* Search Input */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name or SKU..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CAADF] focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product.sku}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        <p className="text-[#0068B3] font-semibold">${product.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => addItem(product)}
                        className="ml-4 bg-[#0068B3] hover:bg-[#005a9e] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <p className="text-center text-gray-500 py-8">No products found for "{searchQuery}"</p>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Start typing to search from {products.length} products
                </p>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Your Cart</h2>
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
                    {items.map((item) => (
                      <div key={item.sku} className="border-b border-gray-200 pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 pr-2">
                            <h3 className="font-medium text-gray-800 text-sm">{item.name}</h3>
                            <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.sku)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="font-semibold text-[#0068B3]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Total */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-[#0068B3]">${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in cart
                    </p>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#F58A34] hover:bg-[#e07a2a] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Checkout on Youngevity
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Opens checkout with Distributor ID: {distributorId}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distributor ID
              </label>
              <input
                type="text"
                value={tempDistributorId}
                onChange={(e) => setTempDistributorId(e.target.value)}
                placeholder="Enter your distributor ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CAADF] focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                This ID will be used for the checkout URL
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 px-4 py-2 bg-[#0068B3] text-white rounded-lg hover:bg-[#005a9e] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
