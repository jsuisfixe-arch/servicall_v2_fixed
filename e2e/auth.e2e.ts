import { test, expect } from "@playwright/test";

test.describe("Authentification", () => {
  test("Échec de connexion avec de mauvais identifiants", async ({ page }) => {
    await page.goto("/login");
    
    // Remplir le formulaire avec de mauvaises infos
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Vérifier qu'un message d'erreur apparaît
    // Note: On cherche une alerte ou un toast d'erreur
    const errorAlert = page.locator('.bg-destructive');
    await expect(errorAlert).toBeVisible();
  });

  test("Validation des champs du formulaire", async ({ page }) => {
    await page.goto("/login");
    
    // Soumettre vide
    await page.click('button[type="submit"]');
    
    // Vérifier les messages de validation (HTML5 ou custom)
    const emailError = page.locator('text=/requis/i');
    await expect(emailError).toBeVisible();
  });
});
