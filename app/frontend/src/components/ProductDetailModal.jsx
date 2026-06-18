import React, { useState } from 'react';

export default function ProductDetailModal({ 
  product, 
  user, 
  cartQty, 
  isInWishlist, 
  onClose, 
  onAddToCart, 
  onUpdateCartQty, 
  onToggleWishlist, 
  onReviewSubmitted 
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:5001/api';

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!comment.trim()) {
      setError('Please enter a comment.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/products/${product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: user.name,
          rating: Number(rating),
          comment: comment.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to submit review.');
        setLoading(false);
        return;
      }

      onReviewSubmitted(data); // Pass updated product back to parent
      setComment('');
      setRating(5);
    } catch (err) {
      setError('Server connection error. Failed to post review.');
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = () => {
    if (!product.reviews || product.reviews.length === 0) return 'No reviews yet';
    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / product.reviews.length).toFixed(1);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} data-cy="product-detail-modal">
      <div className="modal-card detail-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
        
        <div className="detail-modal-body">
          {/* Hero Section */}
          <div className="detail-product-hero">
            <img 
              src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'} 
              alt={product.name} 
              className="detail-img"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e';
              }}
            />
            
            <div className="detail-info">
              <span className="product-badge">{product.category}</span>
              <h2 className="detail-title" data-cy="detail-name">{product.name}</h2>
              
              <div className="product-rating">
                <span className="star-icon" style={{ fontSize: '1.2rem' }}>★</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>{getAverageRating()}</span>
                <span style={{ color: 'var(--text-light)' }}>
                  ({product.reviews ? product.reviews.length : 0} customer reviews)
                </span>
              </div>

              <div className="product-price" style={{ fontSize: '1.8rem', margin: '8px 0' }}>
                <span>$</span>{product.price.toFixed(2)}
              </div>

              <p className="detail-desc" data-cy="detail-desc">{product.description}</p>
              
              <div className="detail-meta-row" style={{ margin: '12px 0 20px' }}>
                <span className={`stock-status ${product.stock > 0 ? 'in' : 'out'}`} data-cy="detail-stock">
                  {product.stock > 0 ? `● In Stock (${product.stock} units)` : '● Out Of Stock'}
                </span>
              </div>

              {/* Actions row */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {cartQty > 0 ? (
                  <div className="qty-selector" style={{ height: '46px' }}>
                    <button 
                      className="qty-btn" 
                      style={{ width: '44px' }}
                      onClick={() => onUpdateCartQty(product._id, cartQty - 1)}
                      data-cy="detail-qty-dec"
                    >
                      −
                    </button>
                    <span className="qty-value" style={{ width: '32px' }} data-cy="detail-qty">{cartQty}</span>
                    <button 
                      className="qty-btn" 
                      style={{ width: '44px' }}
                      onClick={() => onUpdateCartQty(product._id, cartQty + 1)}
                      data-cy="detail-qty-inc"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    className="add-cart-btn" 
                    style={{ padding: '12px 28px', fontSize: '1rem', height: '46px' }}
                    onClick={() => onAddToCart(product._id)}
                    disabled={product.stock <= 0}
                    data-cy="detail-add-cart"
                  >
                    Add to Cart
                  </button>
                )}

                <button 
                  className={`nav-btn ${isInWishlist ? 'active' : ''}`}
                  style={{ width: '46px', height: '46px' }}
                  onClick={() => onToggleWishlist(product._id)}
                  data-cy="detail-btn-wishlist"
                  aria-label="Toggle wishlist"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List and Submission */}
          <div className="reviews-section">
            <h3 className="reviews-header">Customer Reviews</h3>
            
            <div className="reviews-container">
              {!product.reviews || product.reviews.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }} data-cy="no-reviews">
                  No reviews yet for this product. Be the first to share your thoughts!
                </div>
              ) : (
                product.reviews.map((rev) => (
                  <div key={rev._id || rev.createdAt} className="review-card" data-cy="review-card">
                    <div className="review-meta">
                      <span className="review-user" data-cy="review-user">{rev.userName}</span>
                      <span style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="star-icon" style={{ color: star <= rev.rating ? '#fbbf24' : '#e2e8f0' }}>★</span>
                        ))}
                      </span>
                    </div>
                    <p className="review-comment" data-cy="review-comment">{rev.comment}</p>
                    <span className="review-date">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Submit Review */}
            {user ? (
              <form className="write-review-form" onSubmit={handleReviewSubmit}>
                <h4 className="write-review-title">Write a Customer Review</h4>
                
                {error && <div className="auth-error">{error}</div>}

                <div className="rating-select-container">
                  <span className="form-label" style={{ marginRight: '8px' }}>Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`rating-star-btn ${star <= rating ? 'selected' : ''}`}
                      onClick={() => setRating(star)}
                      data-cy={`star-${star}`}
                      aria-label={`Rate ${star} stars`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="review-comment">Your Review</label>
                  <textarea
                    id="review-comment"
                    className="review-textarea"
                    placeholder="Tell us what you liked or disliked about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    data-cy="input-comment"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="review-submit-btn" 
                  disabled={loading}
                  data-cy="btn-submit-review"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div 
                style={{ 
                  background: '#f1f5f9', 
                  padding: '16px 20px', 
                  borderRadius: 'var(--radius-md)', 
                  textAlign: 'center',
                  fontWeight: '600',
                  color: 'var(--text-muted)'
                }}
                data-cy="login-to-review-msg"
              >
                Please log in to submit a review for this product.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
