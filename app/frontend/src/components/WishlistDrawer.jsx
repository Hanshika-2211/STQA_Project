import React from 'react';

export default function WishlistDrawer({ 
  isOpen, 
  onClose, 
  wishlistItems, 
  onToggleWishlist, 
  onAddToCart 
}) {
  if (!isOpen) return null;

  const handleAddToCart = (productId) => {
    onAddToCart(productId);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose} data-cy="wishlist-drawer">
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2 className="drawer-title">My Wishlist</h2>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close wishlist">✕</button>
        </div>

        <div className="drawer-content">
          {wishlistItems.length === 0 ? (
            <div className="drawer-empty-state" data-cy="wishlist-empty">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <p>Your wishlist is empty</p>
            </div>
          ) : (
            wishlistItems.map((product) => {
              if (!product) return null;
              return (
                <div className="drawer-item" key={product._id} data-cy="wishlist-item">
                  <img 
                    src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'} 
                    alt={product.name} 
                    className="drawer-item-img"
                  />
                  <div className="drawer-item-details">
                    <div>
                      <h4 className="drawer-item-name" data-cy="wishlist-item-name">{product.name}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {product.category}
                      </span>
                    </div>

                    <div className="drawer-item-actions" style={{ marginTop: '12px' }}>
                      <button 
                        className="add-cart-btn"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleAddToCart(product._id)}
                        data-cy="btn-wishlist-add-cart"
                      >
                        Add to Cart
                      </button>

                      <button 
                        className="drawer-item-remove"
                        onClick={() => onToggleWishlist(product._id)}
                        data-cy="btn-wishlist-remove"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="drawer-item-price">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
