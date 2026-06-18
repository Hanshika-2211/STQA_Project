import React from 'react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateCartQty, 
  onGoToCheckout 
}) {
  if (!isOpen) return null;

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      if (!item.product) return acc;
      return acc + (item.product.price * item.quantity);
    }, 0);
  };

  const handleCheckoutClick = () => {
    onClose();
    onGoToCheckout();
  };

  return (
    <div className="drawer-backdrop" onClick={onClose} data-cy="cart-drawer">
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2 className="drawer-title">Shopping Cart</h2>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close cart">✕</button>
        </div>

        <div className="drawer-content">
          {cartItems.length === 0 ? (
            <div className="drawer-empty-state" data-cy="cart-empty">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => {
              if (!item.product) return null;
              return (
                <div className="drawer-item" key={item.product._id} data-cy="cart-item">
                  <img 
                    src={item.product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'} 
                    alt={item.product.name} 
                    className="drawer-item-img"
                  />
                  <div className="drawer-item-details">
                    <div>
                      <h4 className="drawer-item-name" data-cy="cart-item-name">{item.product.name}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        ${item.product.price.toFixed(2)} each
                      </span>
                    </div>

                    <div className="drawer-item-actions">
                      <div className="qty-selector">
                        <button 
                          className="qty-btn"
                          onClick={() => onUpdateCartQty(item.product._id, item.quantity - 1)}
                          data-cy="cart-qty-dec"
                        >
                          −
                        </button>
                        <span className="qty-value" data-cy="cart-item-qty">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => onUpdateCartQty(item.product._id, item.quantity + 1)}
                          data-cy="cart-qty-inc"
                        >
                          +
                        </button>
                      </div>

                      <button 
                        className="drawer-item-remove"
                        onClick={() => onUpdateCartQty(item.product._id, 0)}
                        data-cy="btn-remove-item"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="drawer-item-price">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-summary-row">
              <span>Subtotal</span>
              <span data-cy="cart-total">${calculateTotal().toFixed(2)}</span>
            </div>
            <button 
              className="drawer-action-btn"
              onClick={handleCheckoutClick}
              data-cy="btn-checkout"
            >
              Checkout & Buy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
