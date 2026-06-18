package com.quickcommerce.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.time.Duration;

public class QuickCommerceTest {
    private WebDriver driver;
    private WebDriverWait wait;
    private static final String BASE_URL = "http://localhost:5173";
    private String uniqueEmail;

    @BeforeClass
    public void setUp() {
        // Setup ChromeDriver using WebDriverManager
        WebDriverManager.chromedriver().setup();
        
        ChromeOptions options = new ChromeOptions();
        // Headless is set to false explicitly (headless => false is default since we do NOT add "--headless")
        options.addArguments("--start-maximized");
        
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        
        // Unique email for signup flow
        uniqueEmail = "hanshika_sel_" + System.currentTimeMillis() + "@test.com";
    }

    @Test(priority = 1)
    public void test01_userSignup() {
        driver.get(BASE_URL);

        // Click Login modal button
        WebElement loginModalBtn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-cy='btn-login-modal']")));
        loginModalBtn.click();

        // Switch to Sign Up tab
        WebElement signupTab = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-cy='auth-tab-signup']")));
        signupTab.click();

        // Enter details
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='input-name']"))).sendKeys("hanshika Test");
        driver.findElement(By.cssSelector("[data-cy='input-email']")).sendKeys(uniqueEmail);
        driver.findElement(By.cssSelector("[data-cy='input-password']")).sendKeys("Test@123");

        // Submit
        driver.findElement(By.cssSelector("[data-cy='btn-submit']")).click();

        // Assert success toast
        WebElement successToast = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='toast-success']")));
        Assert.assertTrue(successToast.getText().contains("Welcome"));

        // Assert user name in header
        WebElement userName = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='user-name']")));
        Assert.assertTrue(userName.getText().contains("hanshika Test"));
    }

    @Test(priority = 2, dependsOnMethods = "test01_userSignup")
    public void test02_productSearchAndFilter() {
        // Search for Strawberries
        WebElement searchInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='input-search']")));
        searchInput.sendKeys("Strawberries");

        // Wait for product grid to filter (Sea Salt Chips must disappear)
        wait.until(ExpectedConditions.not(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("[data-cy='product-grid']"), "Sea Salt Chips")));

        // Verify product grid details
        WebElement productGrid = driver.findElement(By.cssSelector("[data-cy='product-grid']"));
        Assert.assertTrue(productGrid.getText().contains("Fresh Organic Strawberries"));
        Assert.assertFalse(productGrid.getText().contains("Sea Salt Chips"));

        // Clear search
        searchInput.sendKeys(org.openqa.selenium.Keys.chord(org.openqa.selenium.Keys.COMMAND, "a"), org.openqa.selenium.Keys.BACK_SPACE);
        searchInput.sendKeys(org.openqa.selenium.Keys.chord(org.openqa.selenium.Keys.CONTROL, "a"), org.openqa.selenium.Keys.BACK_SPACE);

        // Wait for product grid to restore and show all items
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("[data-cy='product-grid']"), "Sea Salt Chips"));

        // Filter by category: Bakery
        WebElement filterBakery = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-cy='filter-bakery']")));
        filterBakery.click();

        // Wait for category filter to apply (Fresh Hass Avocados must disappear)
        wait.until(ExpectedConditions.not(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("[data-cy='product-grid']"), "Fresh Hass Avocados")));

        WebElement productGridFiltered = driver.findElement(By.cssSelector("[data-cy='product-grid']"));
        Assert.assertTrue(productGridFiltered.getText().contains("Artisanal Sourdough Bread"));
        Assert.assertFalse(productGridFiltered.getText().contains("Fresh Hass Avocados"));

        // Restore all filters
        WebElement filterAll = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-cy='filter-all']")));
        filterAll.click();

        // Wait for Avocado to reappear
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("[data-cy='product-grid']"), "Fresh Hass Avocados"));
    }

    @Test(priority = 3, dependsOnMethods = "test02_productSearchAndFilter")
    public void test03_wishlistOperations() {
        // Find Sourdough Bread product card and add to wishlist
        WebElement wishlistBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath(
                "//div[@data-cy='product-card' and .//*[contains(text(), 'Artisanal Sourdough Bread')]]//button[@data-cy='btn-wishlist']"
        )));
        wishlistBtn.click();

        // Verify wishlist badge
        WebElement wishlistBadge = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(
                "//button[@data-cy='btn-wishlist-toggle']//*[@data-cy='wishlist-badge']"
        )));
        Assert.assertEquals(wishlistBadge.getText(), "1");

        // Open Wishlist drawer
        WebElement wishlistToggle = driver.findElement(By.cssSelector("[data-cy='btn-wishlist-toggle']"));
        wishlistToggle.click();

        // Verify item in drawer
        WebElement wishlistDrawer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='wishlist-drawer']")));
        Assert.assertTrue(wishlistDrawer.isDisplayed());
        WebElement wishlistName = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='wishlist-item-name']")));
        Assert.assertTrue(wishlistName.getText().contains("Artisanal Sourdough Bread"));

        // Close Wishlist drawer
        WebElement closeBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("[data-cy='wishlist-drawer'] .drawer-close-btn")
        ));
        closeBtn.click();
        
        // Wait for drawer to close
        wait.until(ExpectedConditions.invisibilityOf(wishlistDrawer));
    }

    @Test(priority = 4, dependsOnMethods = "test03_wishlistOperations")
    public void test04_cartOperations() {
        // Add Strawberries to Cart
        WebElement addCartBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath(
                "//div[@data-cy='product-card' and .//*[contains(text(), 'Fresh Organic Strawberries')]]//button[@data-cy='btn-add-cart']"
        )));
        addCartBtn.click();

        // Verify quantity is 1
        WebElement productQty = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(
                "//div[@data-cy='product-card' and .//*[contains(text(), 'Fresh Organic Strawberries')]]//*[@data-cy='product-qty']"
        )));
        Assert.assertEquals(productQty.getText(), "1");

        // Increase quantity to 2
        WebElement qtyIncBtn = driver.findElement(By.xpath(
                "//div[@data-cy='product-card' and .//*[contains(text(), 'Fresh Organic Strawberries')]]//button[@data-cy='btn-qty-inc']"
        ));
        qtyIncBtn.click();

        // Verify quantity updates to 2
        wait.until(ExpectedConditions.textToBe(By.xpath(
                "//div[@data-cy='product-card' and .//*[contains(text(), 'Fresh Organic Strawberries')]]//*[@data-cy='product-qty']"
        ), "2"));
    }

    @Test(priority = 5, dependsOnMethods = "test04_cartOperations")
    public void test05_productDetailAndReviews() {
        // Open details modal by clicking product name
        WebElement prodName = wait.until(ExpectedConditions.elementToBeClickable(By.xpath(
                "//div[@data-cy='product-card']//h3[@data-cy='product-name' and contains(text(), 'Fresh Organic Strawberries')]"
        )));
        prodName.click();

        // Verify details modal is visible
        WebElement detailModal = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='product-detail-modal']")));
        Assert.assertTrue(detailModal.isDisplayed());

        // Submit review: click star 4
        WebElement star4 = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-cy='star-4']")));
        star4.click();

        // Fill comment
        WebElement commentInput = driver.findElement(By.cssSelector("[data-cy='input-comment']"));
        commentInput.sendKeys("These strawberries are fresh and sweet. Will buy again!");

        // Submit review
        WebElement submitReviewBtn = driver.findElement(By.cssSelector("[data-cy='btn-submit-review']"));
        submitReviewBtn.click();

        // Verify review exists in modal
        WebElement reviewCard = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='review-card']")));
        Assert.assertTrue(reviewCard.getText().contains("hanshika Test"));
        Assert.assertTrue(reviewCard.getText().contains("These strawberries are fresh"));

        // Close details modal
        WebElement closeModalBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("[data-cy='product-detail-modal'] .modal-close-btn")
        ));
        closeModalBtn.click();

        // Wait for modal to close
        wait.until(ExpectedConditions.invisibilityOf(detailModal));
    }

    @Test(priority = 6, dependsOnMethods = "test05_productDetailAndReviews")
    public void test06_checkoutAndPurchase() {
        // Open Cart Drawer
        WebElement cartToggle = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-cy='btn-cart-toggle']")));
        cartToggle.click();

        // Verify Cart Drawer is visible
        WebElement cartDrawer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='cart-drawer']")));
        Assert.assertTrue(cartDrawer.isDisplayed());

        // Verify item name and quantity in drawer
        WebElement cartItemName = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='cart-item-name']")));
        Assert.assertTrue(cartItemName.getText().contains("Fresh Organic Strawberries"));
        WebElement cartItemQty = driver.findElement(By.cssSelector("[data-cy='cart-item-qty']"));
        Assert.assertTrue(cartItemQty.getText().contains("2"));

        // Proceed to checkout
        WebElement checkoutBtn = driver.findElement(By.cssSelector("[data-cy='btn-checkout']"));
        checkoutBtn.click();

        // Verify redirection to checkout page
        WebElement checkoutPage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='checkout-page']")));
        Assert.assertTrue(checkoutPage.isDisplayed());

        // Verify checkout details
        WebElement checkoutQty = driver.findElement(By.cssSelector("[data-cy='checkout-item-qty']"));
        Assert.assertTrue(checkoutQty.getText().contains("Qty: 2"));

        // Apply Promo Code
        WebElement promoInput = driver.findElement(By.cssSelector("[data-cy='input-promo']"));
        promoInput.sendKeys("WELCOME10");
        WebElement promoApplyBtn = driver.findElement(By.cssSelector("[data-cy='btn-promo-apply']"));
        promoApplyBtn.click();

        // Verify promo code applied success message
        WebElement checkoutPageUpdated = wait.until(ExpectedConditions.visibilityOf(checkoutPage));
        Assert.assertTrue(checkoutPageUpdated.getText().contains("Promo code applied"));

        // Fill delivery form
        driver.findElement(By.cssSelector("[data-cy='input-address']")).sendKeys("456 Fresh Lane");
        driver.findElement(By.cssSelector("[data-cy='input-city']")).sendKeys("Organic City");
        driver.findElement(By.cssSelector("[data-cy='input-phone']")).sendKeys("555-987-6543");

        // Place order
        WebElement placeOrderBtn = driver.findElement(By.cssSelector("[data-cy='btn-place-order']"));
        placeOrderBtn.click();

        // Verify Order History page redirection
        WebElement orderHistoryPage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='order-history-page']")));
        Assert.assertTrue(orderHistoryPage.isDisplayed());

        // Verify order status and items
        WebElement orderStatus = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-cy='order-status']")));
        Assert.assertTrue(orderStatus.getText().contains("Pending"));
        WebElement orderItemDetail = driver.findElement(By.cssSelector("[data-cy='order-item-detail']"));
        Assert.assertTrue(orderItemDetail.getText().contains("Fresh Organic Strawberries"));
    }

    @AfterClass
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
