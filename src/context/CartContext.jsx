import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("cart-items");
    return saved ? JSON.parse(saved) : [];
  });

  const persist = (nextItems) => {
    setItems(nextItems);
    localStorage.setItem("cart-items", JSON.stringify(nextItems));
  };

  const addToCart = (book) => {
    const exists = items.find((item) => item._id === book._id);
    if (exists) {
      persist(
        items.map((item) =>
          item._id === book._id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock || 99) }
            : item
        )
      );
      return;
    }

    persist([...items, { ...book, quantity: 1 }]);
  };

  const updateQuantity = (bookId, quantity) => {
    if (quantity <= 0) {
      persist(items.filter((item) => item._id !== bookId));
      return;
    }

    persist(
      items.map((item) =>
        item._id === bookId
          ? { ...item, quantity: Math.min(quantity, item.stock || quantity) }
          : item
      )
    );
  };

  const removeFromCart = (bookId) => {
    persist(items.filter((item) => item._id !== bookId));
  };

  const clearCart = () => {
    persist([]);
  };

  const totals = useMemo(() => {
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const subTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subTotal > 0 ? 49 : 0;
    const total = subTotal + shipping;
    return { totalItems, subTotal, shipping, total };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        ...totals
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
