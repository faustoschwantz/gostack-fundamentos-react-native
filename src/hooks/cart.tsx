import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStored = await AsyncStorage.getItem('products');

      if(productsStored)
      setProducts(JSON.parse(productsStored))
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productsAux = [...products];
    const indexFinded = productsAux.findIndex(({id}) => id == product.id)

    if(indexFinded > -1)
      productsAux[indexFinded].quantity = productsAux[indexFinded].quantity + 1
    else
      productsAux.push({...product, quantity: 1})

    setProducts(productsAux)
    await AsyncStorage.setItem('products', JSON.stringify(productsAux));
  }, [products]);

  const increment = useCallback(async id => {
    const productsAux = [...products]
    const productIndex = productsAux.findIndex( product => product.id === id)
    if(productIndex > -1)
    {
      productsAux[productIndex].quantity++
      setProducts(productsAux)
      await AsyncStorage.setItem('products', JSON.stringify(productsAux));
    }
  }, [products]);

  const decrement = useCallback(async id => {
    const productsAux = [...products]
    const productIndex = productsAux.findIndex( product => product.id === id)
    if(productIndex > -1)
    {
      productsAux[productIndex].quantity--
      setProducts(productsAux)
      await AsyncStorage.setItem('products', JSON.stringify(productsAux));
    }
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
