export interface Product {
  name: string;
  sku: string;
  price: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartStore {
  items: CartItem[];
  distributorId: string;
  addItem: (product: Product) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  setDistributorId: (id: string) => void;
  getCheckoutUrl: () => string;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}
