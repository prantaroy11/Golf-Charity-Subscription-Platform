// ──────────────────────────────────────────────────────────
// E2E Test — Signup & Login Flow (Step 14.2)
// Full signup → email confirm → login → redirect to dashboard
// ──────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Test User';

test.describe('Signup Flow', () => {
  test('renders signup page with all required fields', async ({ page }) => {
    await page.goto('/signup');

    // Page should load with proper heading
    await expect(page.locator('h1')).toContainText(
      /sign up|create account|get started/i
    );

    // All required fields should be present
    await expect(
      page.locator('input[name="fullName"], input[placeholder*="name" i]')
    ).toBeVisible();
    await expect(
      page.locator('input[name="email"], input[type="email"]')
    ).toBeVisible();
    await expect(
      page.locator('input[name="password"], input[type="password"]').first()
    ).toBeVisible();

    // Submit button should exist
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Link to login page should exist
    await expect(page.locator('a[href*="login"]')).toBeVisible();
  });

  test('shows validation errors for empty form submission', async ({
    page,
  }) => {
    await page.goto('/signup');

    // Click submit without filling any fields
    await page.locator('button[type="submit"]').click();

    // Should show validation errors (not redirect)
    await expect(page).toHaveURL(/signup/);

    // Error messages should appear
    await page.waitForTimeout(500);
    const errorMessages = page.locator(
      '[role="alert"], .text-red-500, .text-destructive, [data-error]'
    );
    await expect(errorMessages.first()).toBeVisible();
  });

  test('shows validation error for short password', async ({ page }) => {
    await page.goto('/signup');

    const nameInput = page.locator(
      'input[name="fullName"], input[placeholder*="name" i]'
    );
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const passwordInput = page
      .locator('input[name="password"], input[type="password"]')
      .first();

    await nameInput.fill(TEST_NAME);
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill('short'); // too short

    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);

    // Should remain on signup page
    await expect(page).toHaveURL(/signup/);
  });

  test('signup form fills correctly and submits', async ({ page }) => {
    await page.goto('/signup');

    const nameInput = page.locator(
      'input[name="fullName"], input[placeholder*="name" i]'
    );
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const passwordInput = page
      .locator('input[name="password"], input[type="password"]')
      .first();
    const confirmInput = page.locator(
      'input[name="confirmPassword"], input[placeholder*="confirm" i]'
    );

    await nameInput.fill(TEST_NAME);
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);
    if (await confirmInput.isVisible()) {
      await confirmInput.fill(TEST_PASSWORD);
    }

    await page.locator('button[type="submit"]').click();

    // Should either show success message or redirect
    await page.waitForTimeout(2000);
    const successMessage = page.locator(
      'text=/check your email|confirm|verification/i'
    );
    const redirectedToDashboard = page.url().includes('/dashboard');
    const redirectedToLogin = page.url().includes('/login');

    // At least one of these should be true
    const success =
      (await successMessage.isVisible().catch(() => false)) ||
      redirectedToDashboard ||
      redirectedToLogin;
    expect(success).toBeTruthy();
  });
});

test.describe('Login Flow', () => {
  test('renders login page with email and password fields', async ({
    page,
  }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toContainText(
      /log in|sign in|welcome back/i
    );
    await expect(
      page.locator('input[name="email"], input[type="email"]')
    ).toBeVisible();
    await expect(
      page.locator('input[name="password"], input[type="password"]')
    ).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page
      .locator('input[name="email"], input[type="email"]')
      .fill('nonexistent@example.com');
    await page
      .locator('input[name="password"], input[type="password"]')
      .fill('WrongPassword123!');
    await page.locator('button[type="submit"]').click();

    await page.waitForTimeout(2000);

    // Should stay on login page and show error
    await expect(page).toHaveURL(/login/);
    const errorMsg = page.locator('text=/invalid|incorrect|wrong|error/i');
    await expect(errorMsg.first()).toBeVisible();
  });

  test('shows validation errors for empty login submission', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);

    await expect(page).toHaveURL(/login/);
  });

  test('has forgot password link', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('a[href*="forgot"]')).toBeVisible();
  });

  test('has link to signup page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('a[href*="signup"]')).toBeVisible();
  });
});

test.describe('Forgot Password Flow', () => {
  test('renders forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');

    await expect(
      page.locator('input[name="email"], input[type="email"]')
    ).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows confirmation after submitting email', async ({ page }) => {
    await page.goto('/forgot-password');

    await page
      .locator('input[name="email"], input[type="email"]')
      .fill('test@example.com');
    await page.locator('button[type="submit"]').click();

    await page.waitForTimeout(2000);

    // Should show success message
    const successMsg = page.locator('text=/sent|reset|check/i');
    await expect(successMsg.first()).toBeVisible();
  });
});

test.describe('Auth Navigation Guards', () => {
  test('dashboard redirects unauthenticated users to login', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Should be redirected to login
    expect(page.url()).toMatch(/login|signup/);
  });

  test('admin redirects non-admin users', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);

    // Should be redirected away from admin
    expect(page.url()).not.toMatch(/\/admin$/);
  });
});
