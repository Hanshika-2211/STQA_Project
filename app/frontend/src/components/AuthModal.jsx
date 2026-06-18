import React, { useState } from 'react';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:5001/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (activeTab === 'signup' && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    const endpoint = activeTab === 'login' ? '/auth/login' : '/auth/signup';
    const body = activeTab === 'login' 
      ? { email, password } 
      : { name, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setError('Connection refused. Please make sure the backend is running.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} data-cy="auth-modal">
      <div className="modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setError(''); }}
            data-cy="auth-tab-login"
          >
            Log In
          </button>
          <button 
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signup'); setError(''); }}
            data-cy="auth-tab-signup"
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error" data-cy="auth-error">
              {error}
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name</label>
              <input 
                id="auth-name"
                type="text" 
                className="form-input" 
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-cy="input-name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <input 
              id="auth-email"
              type="email" 
              className="form-input" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-cy="input-email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input 
              id="auth-password"
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-cy="input-password"
              required
            />
          </div>

          <button type="submit" className="form-btn" data-cy="btn-submit">
            {activeTab === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
