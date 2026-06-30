describe('QuickCommerce E2E Test Suite', () => {
  before(() => {
    // Start fresh on home page
    cy.visit('/');
  });

  it('Flow 1: User Signup', () => {
    cy.get('[data-cy="btn-login-modal"]').click();
    cy.get('[data-cy="auth-tab-signup"]').click();
    cy.get('[data-cy="input-name"]').type('Hanshika Test');
    cy.get('[data-cy="input-email"]').type(`Hanshika_${Date.now()}@test.com`); // Unique email per run
    cy.get('[data-cy="input-password"]').type('Test@123');
    cy.get('[data-cy="btn-submit"]').click();

    // Verify successful login
    cy.get('[data-cy="toast-success"]').should('be.visible').and('contain', 'Welcome');
    cy.get('[data-cy="user-name"]').should('be.visible').and('contain', 'Hanshika Test');
  });

  it('Flow 2: Product Search & Filter', () => {
    cy.get('[data-cy="input-search"]').type('Strawberries');
    cy.get('[data-cy="product-grid"]').should('contain', 'Fresh Organic Strawberries');
    cy.get('[data-cy="product-grid"]').should('not.contain', 'Sea Salt Chips');

    // Clear search
    cy.get('[data-cy="input-search"]').clear();

    // Filter by category
    cy.get('[data-cy="filter-bakery"]').click();
    cy.get('[data-cy="product-grid"]').should('contain', 'Artisanal Sourdough Bread');
    cy.get('[data-cy="product-grid"]').should('not.contain', 'Fresh Hass Avocados');

    // Restore all filters
    cy.get('[data-cy="filter-all"]').click();
  });

  it('Flow 3: Wishlist Operations', () => {
    // Add Sourdough Bread to Wishlist
    cy.get('[data-cy="product-card"]').contains('Artisanal Sourdough Bread')
      .parents('[data-cy="product-card"]').find('[data-cy="btn-wishlist"]').click();
    cy.get('[data-cy="btn-wishlist-toggle"]').find('[data-cy="wishlist-badge"]').should('contain', '1');

    // Open Wishlist Drawer and verify
    cy.get('[data-cy="btn-wishlist-toggle"]').click();
    cy.get('[data-cy="wishlist-drawer"]').should('be.visible');
    cy.get('[data-cy="wishlist-item-name"]').should('contain', 'Artisanal Sourdough Bread');
    // Close Drawer
    cy.get('[data-cy="wishlist-drawer"]').find('.drawer-close-btn').click();
  });

  it('Flow 4: Cart Operations', () => {
    // Add Strawberries to Cart
    cy.get('[data-cy="product-card"]').contains('Fresh Organic Strawberries')
      .parents('[data-cy="product-card"]').find('[data-cy="btn-add-cart"]').click();

    // Verify quantity turns to 1
    cy.get('[data-cy="product-card"]').contains('Fresh Organic Strawberries')
      .parents('[data-cy="product-card"]').find('[data-cy="product-qty"]').should('contain', '1');

    // Increase quantity to 2
    cy.get('[data-cy="product-card"]').contains('Fresh Organic Strawberries')
      .parents('[data-cy="product-card"]').find('[data-cy="btn-qty-inc"]').click();
    cy.get('[data-cy="product-card"]').contains('Fresh Organic Strawberries')
      .parents('[data-cy="product-card"]').find('[data-cy="product-qty"]').should('contain', '2');
  });

  it('Flow 5: Product Detail & Reviews', () => {
    // Open product details modal
    cy.get('[data-cy="product-name"]').contains('Fresh Organic Strawberries').click();
    cy.get('[data-cy="product-detail-modal"]').should('be.visible');

    // Submit review
    const uniqueComment = `These strawberries are fresh and sweet. Will buy again! ${Date.now()}`;
    cy.get('[data-cy="star-4"]').click();
    cy.get('[data-cy="input-comment"]').type(uniqueComment);
    cy.get('[data-cy="btn-submit-review"]').click();

    // Verify review was added
    cy.get('[data-cy="review-card"]').should('have.length.at.least', 1);
    cy.get('[data-cy="review-user"]').should('contain', 'Hanshika Test');
    cy.get('[data-cy="review-comment"]').should('contain', uniqueComment);

    // Close details modal
    cy.get('[data-cy="product-detail-modal"]').find('.modal-close-btn').click();
    cy.get('[data-cy="product-detail-modal"]').should('not.exist');
  });

  it('Flow 6: Checkout & Purchase', () => {
    // Open Cart Drawer
    cy.get('[data-cy="btn-cart-toggle"]').click();
    cy.get('[data-cy="cart-drawer"]').should('be.visible');
    cy.get('[data-cy="cart-item-name"]').should('contain', 'Fresh Organic Strawberries');
    cy.get('[data-cy="cart-item-qty"]').should('contain', '2');

    // Go to checkout
    cy.get('[data-cy="btn-checkout"]').click();
    cy.get('[data-cy="checkout-page"]').should('be.visible');
    cy.get('[data-cy="checkout-item-qty"]').should('contain', 'Qty: 2');

    // Apply Promo Code
    cy.get('[data-cy="input-promo"]').type('WELCOME10');
    cy.get('[data-cy="btn-promo-apply"]').click();
    cy.get('[data-cy="checkout-page"]').should('contain', 'Promo code applied');

    // Fill delivery form
    cy.get('[data-cy="input-address"]').type('456 Fresh Lane');
    cy.get('[data-cy="input-city"]').type('Organic City');
    cy.get('[data-cy="input-phone"]').type('555-987-6543');

    // Submit order
    cy.get('[data-cy="btn-place-order"]').click();

    // Verify redirection to Order History showing new pending order
    cy.get('[data-cy="order-history-page"]').should('be.visible');
    cy.get('[data-cy="order-card"]').should('have.length.at.least', 1);
    cy.get('[data-cy="order-status"]').first().should('contain', 'Pending');
    cy.get('[data-cy="order-item-detail"]').first().should('contain', 'Fresh Organic Strawberries');
  });
});
