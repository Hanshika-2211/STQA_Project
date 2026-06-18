import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import AuthModal from './components/AuthModal';
import CheckoutPage from './components/CheckoutPage';
import OrderHistory from './components/OrderHistory';

const API_URL = 'http://localhost:5001/api';
const CATEGORIES = ['All', 'Fruits & Vegetables', 'Bakery', 'Beverages', 'Snacks'];

export default function App() {
  // ── Authentication States ──────────────────────────────────────────
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('qc_user');
    return saved ? JSON.parse(saved) : null;
  });

  // ── View States ────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState('shop'); // 'shop', 'checkout', 'history'
  const [successToast, setSuccessToast] = useState('');

  // ── Catalog States ─────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // ── Cart & Wishlist States ─────────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // ── Modals & Drawers Toggles ───────────────────────────────────────
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // Triggers detail modal

  // ── Fetch Products on Search / Category Change ────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/products`;
        const params = [];
        if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
        if (selectedCategory && selectedCategory !== 'All') {
          params.push(`category=${encodeURIComponent(selectedCategory)}`);
        }
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedCategory]);

  // ── Sync Cart & Wishlist on Auth changes ──────────────────────────
  useEffect(() => {
    const syncUserData = async () => {
      if (!user) {
        setCart([]);
        setWishlist([]);
        return;
      }

      try {
        // Fetch DB Cart
        const cartRes = await fetch(`${API_URL}/user/${user._id}/cart`);
        const cartData = await cartRes.json();
        if (cartRes.ok) setCart(cartData);

        // Fetch DB Wishlist
        const wishlistRes = await fetch(`${API_URL}/user/${user._id}/wishlist`);
        const wishlistData = await wishlistRes.json();
        if (wishlistRes.ok) setWishlist(wishlistData);
      } catch (err) {
        console.error('Failed to sync user data:', err);
      }
    };

    syncUserData();
  }, [user]);

  // ── Action Handlers ────────────────────────────────────────────────
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('qc_user', JSON.stringify(userData));
    setSuccessToast(`Welcome back, ${userData.name}!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('qc_user');
    setCart([]);
    setWishlist([]);
    setCurrentView('shop');
    setSuccessToast('Logged out successfully.');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Add/Update Cart Quantities
  const handleUpdateCartQty = async (productId, quantity) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    let updatedCart = [...cart];
    const index = updatedCart.findIndex(item => item.product && item.product._id === productId);

    if (index > -1) {
      if (quantity <= 0) {
        updatedCart.splice(index, 1);
      } else {
        updatedCart[index].quantity = quantity;
      }
    } else if (quantity > 0) {
      updatedCart.push({ product: { _id: productId }, quantity });
    }

    // Pessimistically update the local state with reference placeholder, 
    // but the backend will return the populated product objects.
    try {
      const response = await fetch(`${API_URL}/user/${user._id}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cart: updatedCart.map(item => ({
            product: item.product._id,
            quantity: item.quantity
          }))
        })
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data);
      }
    } catch (err) {
      console.error('Failed to update cart on server:', err);
    }
  };

  const handleAddToCart = (productId) => {
    handleUpdateCartQty(productId, 1);
  };

  // Wishlist Toggles
  const handleToggleWishlist = async (productId) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user/${user._id}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      });
      const data = await response.json();
      if (response.ok) {
        setWishlist(data);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist on server:', err);
    }
  };

  // Review Submitted Callback
  const handleReviewSubmitted = (updatedProduct) => {
    // 1. Update the product detail modal state if open
    setSelectedProduct(updatedProduct);

    // 2. Update the product in the local state catalog list
    setProducts(prevProducts => 
      prevProducts.map(p => p._id === updatedProduct._id ? updatedProduct : p)
    );
  };

  // Order Success Callback
  const handleOrderSuccess = (order) => {
    setCart([]); // Clear cart
    setCurrentView('history');
    setSuccessToast(`Order placed successfully! Order ID: ${order._id}`);
    setTimeout(() => setSuccessToast(''), 6000);
  };

  // ── Render Utilities ────────────────────────────────────────────────
  const getProductCartQty = (productId) => {
    const item = cart.find(item => item.product && item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const isProductInWishlist = (productId) => {
    return wishlist.some(item => item && item._id === productId);
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navbar 
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartTotalCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
        onGoToHistory={() => { setCurrentView('history'); }}
        onGoToShop={() => { setCurrentView('shop'); }}
      />

      {/* Main Page Body */}
      <main className="main-content">
        {/* Toast alert */}
        {successToast && (
          <div className="toast-success" data-cy="toast-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{successToast}</span>
          </div>
        )}

        {currentView === 'shop' && (
          <>
            {/* Category selection */}
            <div className="categories-container" data-cy="category-filters">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  data-cy={`filter-${cat.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-')}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid listings */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                Loading fresh products...
              </div>
            ) : products.length === 0 ? (
              <div 
                style={{ 
                  textAlign: 'center', 
                  padding: '80px 20px', 
                  background: '#ffffff', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)' 
                }}
                data-cy="no-products-msg"
              >
                No products found matching your search.
              </div>
            ) : (
              <div className="product-grid" data-cy="product-grid">
                {products.map((prod) => (
                  <ProductCard 
                    key={prod._id}
                    product={prod}
                    cartQty={getProductCartQty(prod._id)}
                    isInWishlist={isProductInWishlist(prod._id)}
                    onAddToCart={handleAddToCart}
                    onUpdateCartQty={handleUpdateCartQty}
                    onToggleWishlist={handleToggleWishlist}
                    onOpenDetails={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {currentView === 'checkout' && (
          <CheckoutPage 
            user={user}
            cartItems={cart}
            onOrderSuccess={handleOrderSuccess}
            onBackToShop={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'history' && (
          <OrderHistory 
            user={user}
            onBackToShop={() => setCurrentView('shop')}
          />
        )}
      </main>

      {/* Side Panels Drawers */}
      <CartDrawer 
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cart}
        onUpdateCartQty={handleUpdateCartQty}
        onGoToCheckout={() => {
          if (!user) {
            setAuthOpen(true);
          } else {
            setCurrentView('checkout');
          }
        }}
      />

      <WishlistDrawer 
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlistItems={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* Overlays Modals */}
      {authOpen && (
        <AuthModal 
          onClose={() => setAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          user={user}
          cartQty={getProductCartQty(selectedProduct._id)}
          isInWishlist={isProductInWishlist(selectedProduct._id)}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onUpdateCartQty={handleUpdateCartQty}
          onToggleWishlist={handleToggleWishlist}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
