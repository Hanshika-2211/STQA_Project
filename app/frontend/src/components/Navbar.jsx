import React from 'react';

export default function Navbar({ 
  user, 
  searchQuery, 
  onSearchChange, 
  cartCount, 
  wishlistCount, 
  onOpenCart, 
  onOpenWishlist, 
  onOpenAuth, 
  onLogout, 
  onGoToHistory, 
  onGoToShop 
}) {
  return (
    <nav className="navbar" data-cy="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <div className="nav-brand" onClick={onGoToShop} style={{ cursor: 'pointer' }} data-cy="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '4px' }}>
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span>FreshCart</span>
        </div>

        {/* Search Bar */}
        <div className="nav-search-bar">
          <svg 
            className="nav-search-icon" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            className="nav-search-input" 
            placeholder="Search groceries, bakery, beverages..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            data-cy="input-search"
          />
        </div>

        {/* Action Buttons */}
        <div className="nav-actions">
          {/* Wishlist Trigger */}
          <button 
            className="nav-btn" 
            onClick={onOpenWishlist}
            data-cy="btn-wishlist-toggle"
            aria-label="Wishlist"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && <span className="btn-badge" data-cy="wishlist-badge">{wishlistCount}</span>}
          </button>

          {/* Cart Trigger */}
          <button 
            className="nav-btn" 
            onClick={onOpenCart}
            data-cy="btn-cart-toggle"
            aria-label="Cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className="btn-badge" data-cy="cart-badge">{cartCount}</span>}
          </button>

          {/* User Auth Profile Links */}
          {user ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="user-menu-btn" onClick={onGoToHistory} data-cy="btn-history">
                <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <span style={{ fontSize: '0.9rem' }} data-cy="user-name">{user.name}</span>
              </button>
              <button 
                className="auth-nav-btn login" 
                style={{ padding: '8px 14px', fontSize: '0.85rem' }} 
                onClick={onLogout}
                data-cy="btn-logout"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="auth-nav-btn login" 
                onClick={() => onOpenAuth()}
                data-cy="btn-login-modal"
              >
                Log In
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
