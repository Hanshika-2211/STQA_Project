import React, { useState } from 'react';

export default function CheckoutPage({ 
  user, 
  cartItems, 
  onOrderSuccess, 
  onBackToShop 
}) {
  const [fullName, setFullName] = useState(user ? user.name : '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discountPercent, freeShipping }
  const [promoError, setPromoError] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:5001/api';

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      if (!item.product) return acc;
      return acc + (item.product.price * item.quantity);
    }, 0);
  };

  const getDeliveryFee = () => {
    if (appliedPromo && appliedPromo.freeShipping) return 0;
    return 2.50;
  };

  const getDiscount = () => {
    if (!appliedPromo || !appliedPromo.discountPercent) return 0;
    return getSubtotal() * (appliedPromo.discountPercent / 100);
  };

  const getGrandTotal = () => {
    return getSubtotal() + getDeliveryFee() - getDiscount();
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'WELCOME10') {
      setAppliedPromo({ code, discountPercent: 10, freeShipping: false });
      setPromoCode('');
    } else if (code === 'FREESHIP') {
      setAppliedPromo({ code, discountPercent: 0, freeShipping: true });
      setPromoCode('');
    } else {
      setPromoError('Invalid promo code. Try WELCOME10 or FREESHIP');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to place an order.');
      return;
    }
    if (!fullName || !address || !city || !phone) {
      setError('Please complete the delivery details form.');
      return;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError('');

    const orderPayload = {
      userId: user._id,
      items: cartItems.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total: getGrandTotal(),
      deliveryDetails: {
        fullName,
        address,
        city,
        phone
      }
    };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to place the order.');
        setLoading(false);
        return;
      }

      onOrderSuccess(data); // Clear cart and display order history/success screen
    } catch (err) {
      setError('Server connection error. Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getSubtotal();

  return (
    <div className="checkout-container" data-cy="checkout-page">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button 
          onClick={onBackToShop} 
          style={{ alignSelf: 'flex-start', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
          data-cy="btn-back-shop"
        >
          ← Continue Shopping
        </button>

        <div className="checkout-main">
          {error && <div className="auth-error" data-cy="checkout-error">{error}</div>}

          {/* Section 1: Order Review */}
          <div>
            <h3 className="checkout-section-title">
              <span>1</span> Review Your Order
            </h3>
            <div className="checkout-items-list">
              {cartItems.map((item) => {
                if (!item.product) return null;
                return (
                  <div key={item.product._id} className="checkout-item" data-cy="checkout-item">
                    <img 
                      src={item.product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'} 
                      alt={item.product.name} 
                      className="checkout-item-img"
                    />
                    <div className="checkout-item-name">{item.product.name}</div>
                    <div className="checkout-item-qty" data-cy="checkout-item-qty">Qty: {item.quantity}</div>
                    <div className="checkout-item-subtotal">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Delivery details */}
          <div>
            <h3 className="checkout-section-title">
              <span>2</span> Delivery Details
            </h3>
            <form className="checkout-form-grid" onSubmit={handlePlaceOrder}>
              <div className="form-group checkout-form-full">
                <label className="form-label" htmlFor="checkout-fullname">Recipient's Full Name</label>
                <input
                  id="checkout-fullname"
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  data-cy="input-fullname"
                  required
                />
              </div>

              <div className="form-group checkout-form-full">
                <label className="form-label" htmlFor="checkout-address">Delivery Address</label>
                <input
                  id="checkout-address"
                  type="text"
                  className="form-input"
                  placeholder="Street name, house number, apartment"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  data-cy="input-address"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="checkout-city">City</label>
                <input
                  id="checkout-city"
                  type="text"
                  className="form-input"
                  placeholder="e.g. San Francisco"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  data-cy="input-city"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="checkout-phone">Contact Number</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  data-cy="input-phone"
                  required
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Checkout Sidebar Summary */}
      <div className="checkout-summary-card">
        <h3 className="summary-title">Payment Summary</h3>
        
        <div className="summary-row">
          <span>Items Subtotal</span>
          <span data-cy="checkout-subtotal">${subtotal.toFixed(2)}</span>
        </div>

        <div className="summary-row">
          <span>Delivery Fee</span>
          <span>${getDeliveryFee().toFixed(2)}</span>
        </div>

        {appliedPromo && (
          <div className="summary-row discount">
            <span>Promo Code ({appliedPromo.code})</span>
            <span>-${getDiscount().toFixed(2)}</span>
          </div>
        )}

        <div className="summary-row total">
          <span>Total to Pay</span>
          <span data-cy="checkout-total">${getGrandTotal().toFixed(2)}</span>
        </div>

        {/* Promo input */}
        <form className="promo-section" onSubmit={handleApplyPromo}>
          <input
            type="text"
            className="promo-input"
            placeholder="Promo (WELCOME10 / FREESHIP)"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            data-cy="input-promo"
          />
          <button type="submit" className="promo-apply-btn" data-cy="btn-promo-apply">Apply</button>
        </form>
        {promoError && <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: '600', marginTop: '-10px', marginBottom: '10px' }}>{promoError}</p>}
        {appliedPromo && <p style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600', marginTop: '-10px', marginBottom: '10px' }}>Promo code applied successfully!</p>}

        <button 
          type="button" 
          className="order-btn" 
          onClick={handlePlaceOrder}
          disabled={loading}
          data-cy="btn-place-order"
        >
          {loading ? 'Processing Order...' : 'Confirm & Buy Now'}
        </button>
      </div>
    </div>
  );
}
