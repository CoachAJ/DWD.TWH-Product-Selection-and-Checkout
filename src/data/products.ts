import { Product } from '../types';

export let products: Product[] = [];

export async function loadProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/products.json');
    const data = await response.json();
    
    // Clean product names but keep all valid products
    products = data
      .filter((p: Product) => 
        p.name && 
        p.sku && 
        typeof p.price === 'number'
      )
      .map((p: Product) => ({
        // Clean up special characters for display
        name: p.name
          .replace(/[™®©]/g, '')
          .replace(/�/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
        sku: p.sku,
        price: p.price,
      }));
    
    console.log(`Loaded ${products.length} products`);
    return products;
  } catch (error) {
    console.error('Failed to load products:', error);
    return [];
  }
}
