import { test, expect } from "@playwright/test";

/**
 * Smoke tests E2E — Servicall
 * Ces tests vérifient que les pages critiques sont accessibles et rendues correctement.
 * Ils nécessitent que l'application soit démarrée (baseURL dans playwright.config.ts).
 */

test.describe("Smoke tests — Pages publiques", () => {
  test("La page de login est accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Servicall/i);
    // Le formulaire de login doit être présent
    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();
    await expect(page.locator("input[type='password'], input[name='password']")).toBeVisible();
  });

  test("La page d'accueil redirige vers /login si non authentifié", async ({ page }) => {
    await page.goto("/");
    // Doit rediriger vers login
    await expect(page).toHaveURL(/\/login/);
  });

  test("La page /privacy est accessible sans authentification", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("body")).toBeVisible();
  });

  test("La page /terms est accessible sans authentification", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Smoke tests — Responsive mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14

  test("La page de login est utilisable sur mobile", async ({ page }) => {
    await page.goto("/login");
    // Vérifier que le formulaire est visible et non masqué par la navigation
    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();
    // Vérifier qu'il n'y a pas de débordement horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // Tolérance de 5px
  });
});

test.describe("Smoke tests — Sécurité basique", () => {
  test("Les routes protégées redirigent vers /login", async ({ page }) => {
    const protectedRoutes = ["/dashboard", "/prospects", "/calls", "/billing"];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
