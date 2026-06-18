import React from 'react';

export default function ProductCard({ 
  product, 
  cartQty, 
  isInWishlist, 
  onAddToCart, 
  onUpdateCartQty, 
  onToggleWishlist, 
  onOpenDetails 
}) {
  const getAverageRating = () => {
    if (!product.reviews || product.reviews.length === 0) return 'No reviews';
    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / product.reviews.length).toFixed(1);
  };

  return (
    <div className="product-card" data-cy="product-card" data-id={product._id}>
      <button 
        className={`product-wishlist-toggle ${isInWishlist ? 'active' : ''}`}
        onClick={() => onToggleWishlist(product._id)}
        data-cy="btn-wishlist"
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <div className="product-image-container" onClick={() => onOpenDetails(product)}>
        <img 
          src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'} 
          alt={product.name} 
          className="product-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e';
          }}
        />
      </div>

      <span className="product-badge">{product.category}</span>
      <h3 className="product-title" onClick={() => onOpenDetails(product)} data-cy="product-name">
        {product.name}
      </h3>

      <div className="product-rating">
        <span className="star-icon">★</span>
        <span>{getAverageRating()}</span>
        {product.reviews && product.reviews.length > 0 && (
          <span style={{ color: 'var(--text-light)', marginLeft: '4px' }}>
            ({product.reviews.length})
          </span>
        )}
      </div>

      <div className="product-footer">
        <div className="product-price">
          <span>$</span>{product.price.toFixed(2)}
        </div>

        {cartQty > 0 ? (
          <div className="qty-selector">
            <button 
              className="qty-btn" 
              onClick={() => onUpdateCartQty(product._id, cartQty - 1)}
              data-cy="btn-qty-dec"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="qty-value" data-cy="product-qty">{cartQty}</span>
            <button 
              className="qty-btn" 
              onClick={() => onUpdateCartQty(product._id, cartQty + 1)}
              data-cy="btn-qty-inc"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        ) : (
          <button 
            className="add-cart-btn" 
            onClick={() => onAddToCart(product._id)}
            data-cy="btn-add-cart"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Add
          </button>
        )}
      </div>
    </div>
  );
}
