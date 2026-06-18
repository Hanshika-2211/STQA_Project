import React, { useEffect, useState } from 'react';

export default function OrderHistory({ user, onBackToShop }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:5001/api';

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/orders/${user._id}`);
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Failed to fetch order history.');
        } else {
          setOrders(data);
        }
      } catch (err) {
        setError('Could not connect to the backend server.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        Loading your order history...
      </div>
    );
  }

  return (
    <div data-cy="order-history-page">
      <div className="orders-page-header">
        <h2 className="orders-page-title">Your Orders</h2>
        <button 
          onClick={onBackToShop} 
          style={{ color: 'var(--primary)', fontWeight: '600' }}
          data-cy="history-btn-back"
        >
          ← Back to Shopping
        </button>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '20px' }}>{error}</div>}

      {orders.length === 0 ? (
        <div 
          style={{ 
            background: '#ffffff', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-md)', 
            padding: '60px 20px', 
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}
          data-cy="no-orders"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M16 12H8" />
          </svg>
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card" data-cy="order-card" data-id={order._id}>
              <div className="order-card-header">
                <div className="order-meta-info">
                  <div className="meta-item">
                    <span className="meta-label">Order Placed</span>
                    <span className="meta-value">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Order ID</span>
                    <span className="meta-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {order._id}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Ship To</span>
                    <span className="meta-value" title={order.deliveryDetails.address}>
                      {order.deliveryDetails.fullName}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Total Amount</span>
                    <span className="meta-value" style={{ color: 'var(--primary)', fontWeight: '800' }} data-cy="order-total">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <span className="order-status-badge" data-cy="order-status">
                  {order.status}
                </span>
              </div>

              <div className="order-card-body">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-summary-item" data-cy="order-item-detail">
                    <span className="order-summary-item-name">
                      {item.name} <span className="order-summary-item-qty">x{item.quantity}</span>
                    </span>
                    <span className="order-summary-item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
